import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfessionalTitleEntity } from '../entities/professional-title.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  ProfessionalTitleDTO,
  ProfessionalTitleResultDTO,
  ProfessionalTitleUpdateDTO,
} from '../dto/professional-title.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 } from 'uuid';

@Injectable()
export class ProfessionalTitleService {
  constructor(
    @InjectRepository(ProfessionalTitleEntity)
    private readonly ProfessionalTitleRepository: Repository<ProfessionalTitleEntity>,
  ) {}

  public async createProfessionalTitle(
    body: ProfessionalTitleDTO,
  ): Promise<ProfessionalTitleEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }

      const objProfessionalTitle = new ProfessionalTitleEntity();
      objProfessionalTitle.name = body.name;
      objProfessionalTitle.slug = body.slug;
      return await this.ProfessionalTitleRepository.save(objProfessionalTitle);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProfessionalTitle(
    page: number,
    limit: number,
    search: string,
  ): Promise<ProfessionalTitleResultDTO> {
    try {
      const queryBuilder =
        this.ProfessionalTitleRepository.createQueryBuilder('professional_title');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('professional_title.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [ProfessionalTitle, totalElements] = await queryBuilder
        .orderBy('professional_title.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...ProfessionalTitle],
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
    key: keyof ProfessionalTitleDTO;
    value: any;
  }) {
    try {
      const ProfessionalTitle =
        await this.ProfessionalTitleRepository.createQueryBuilder('professional_title')
          .where({ [key]: value })
          .getOne();

      return ProfessionalTitle;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProfessionalTitleById(
    id: string,
  ): Promise<ProfessionalTitleEntity> {
    try {
      const ProfessionalTitle: ProfessionalTitleEntity =
        await this.ProfessionalTitleRepository.createQueryBuilder('professional_title')
          .where({ id })
          .getOne();
      return ProfessionalTitle;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProfessionalTitle(
    id: string,
    body: ProfessionalTitleUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ProfessionalTitleToUpdate =
        await this.ProfessionalTitleRepository.findOneBy({ id });

      if (!ProfessionalTitleToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el titulo ',
        });
      }
      const updateData: Partial<ProfessionalTitleEntity> = {
        name: body.name,
        slug: body.slug
      };
      return await this.ProfessionalTitleRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteProfessionalTitle(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.updateProfessionalTitle(id, {name: v4(), slug: v4()})
      const ProfessionalTitle: DeleteResult =
        await this.ProfessionalTitleRepository.softDelete(id);
      if (ProfessionalTitle.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return ProfessionalTitle;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
