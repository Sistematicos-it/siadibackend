import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointStatusEntity } from '../entities/point-status.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  PointStatusDTO,
  PointStatusResultDTO,
  PointStatusUpdateDTO,
} from '../dto/point-status.dto';
import { ErrorManager } from '../../../../utils/error.manager';

@Injectable()
export class PointStatusService {
  constructor(
    @InjectRepository(PointStatusEntity)
    private readonly PointStatusRepository: Repository<PointStatusEntity>,
  ) {}

  public async createPointStatus(
    body: PointStatusDTO,
  ): Promise<PointStatusEntity> {
    try {
      const objPointStatus = new PointStatusEntity();
      objPointStatus.name = body.name;
      return await this.PointStatusRepository.save(objPointStatus);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findPointStatus(
    page: number,
    limit: number,
    search: string,
  ): Promise<PointStatusResultDTO> {
    try {
      const queryBuilder =
        this.PointStatusRepository.createQueryBuilder('point_status');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('point_status.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [PointStatus, totalElements] = await queryBuilder
        .orderBy('point_status.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...PointStatus],
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
    key: keyof PointStatusDTO;
    value: any;
  }) {
    try {
      const PointStatus =
        await this.PointStatusRepository.createQueryBuilder('point_status')
          .where({ [key]: value })
          .getOne();

      return PointStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPointStatusById(
    id: string,
  ): Promise<PointStatusEntity> {
    try {
      const PointStatus: PointStatusEntity =
        await this.PointStatusRepository.createQueryBuilder('point_status')
          .where({ id })
          .getOne();
      return PointStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePointStatus(
    id: string,
    body: PointStatusUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const PointStatusToUpdate =
        await this.PointStatusRepository.findOneBy({ id });

      if (!PointStatusToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la estados',
        });
      }
      const updateData: Partial<PointStatusEntity> = {
        name: body.name,
      };
      return await this.PointStatusRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePointStatus(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const PointStatus: DeleteResult =
        await this.PointStatusRepository.softDelete(id);
      if (PointStatus.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return PointStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
