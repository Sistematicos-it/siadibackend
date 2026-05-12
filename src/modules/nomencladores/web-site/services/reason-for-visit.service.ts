import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReasonForVisitEntity } from '../entities/reason-for-visit.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  ReasonForVisitDTO,
  ReasonForVisitResultDTO,
  ReasonForVisitUpdateDTO,
} from '../dto/reason-for-visit.dto';
import { ErrorManager } from '../../../../utils/error.manager';

@Injectable()
export class ReasonForVisitService {
  constructor(
    @InjectRepository(ReasonForVisitEntity)
    private readonly ReasonForVisitRepository: Repository<ReasonForVisitEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.ReasonForVisitRepository.createQueryBuilder('reasonOfVisit');

    query = query.where('reasonOfVisit.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('reasonOfVisit.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createReasonForVisit(
    body: ReasonForVisitDTO,
  ): Promise<ReasonForVisitEntity> {
    try {
      const objReasonForVisit = new ReasonForVisitEntity();
      objReasonForVisit.name = body.name;
      objReasonForVisit.description = body.description;
      return await this.ReasonForVisitRepository.save(objReasonForVisit);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findReasonForVisit(
    page: number,
    limit: number,
    search: string,
  ): Promise<ReasonForVisitResultDTO> {
    try {
      const queryBuilder =
        this.ReasonForVisitRepository.createQueryBuilder('reasonForVisit');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('reasonForVisit.name ILIKE :search OR reasonForVisit.description ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [ReasonForVisit, totalElements] = await queryBuilder
        .orderBy('reasonForVisit.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...ReasonForVisit],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof ReasonForVisitDTO;
    value: any;
  }) {
    try {
      const ReasonForVisit =
        await this.ReasonForVisitRepository.createQueryBuilder('reasonForVisit')
          .leftJoinAndSelect('reasonForVisit.services', 'services')
          .where({ [key]: value })
          .getOne();

      return ReasonForVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReasonForVisitById(
    id: string,
  ): Promise<ReasonForVisitEntity> {
    try {
      const ReasonForVisit: ReasonForVisitEntity =
        await this.ReasonForVisitRepository.createQueryBuilder('reasonForVisit')
          .leftJoinAndSelect('reasonForVisit.services', 'services')
          .where({ id })
          .getOne();
      return ReasonForVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateReasonForVisit(
    id: string,
    body: ReasonForVisitUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ReasonForVisitToUpdate =
        await this.ReasonForVisitRepository.findOneBy({ id });

      if (!ReasonForVisitToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Especializacion',
        });
      }
      const updateData: Partial<ReasonForVisitEntity> = {
        name: body.name,
        description: body.description
      };
      return await this.ReasonForVisitRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteReasonForVisit(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const ReasonForVisit: DeleteResult =
        await this.ReasonForVisitRepository.softDelete(id);
      if (ReasonForVisit.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return ReasonForVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
