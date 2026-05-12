import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  ServiceStatusDTO,
  ServiceStatusResultDTO,
  ServiceStatusUpdateDTO,
} from '../dto/service-status.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';
import { ServiceStatusEntity } from '../entities/service-status.entity';

@Injectable()
export class ServiceStatusService {
  constructor(
    @InjectRepository(ServiceStatusEntity)
    private readonly ServiceStatusRepository: Repository<ServiceStatusEntity>,
  ) {}

  public async createServiceStatus(
    body: ServiceStatusDTO,
  ): Promise<ServiceStatusEntity> {
    try {
      const objServiceStatus = new ServiceStatusEntity();
      objServiceStatus.name = body.name;
      objServiceStatus.slug = slugify(body.name, { lower: true });
      return await this.ServiceStatusRepository.save(objServiceStatus);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findServiceStatus(
    page: number,
    limit: number,
    search: string,
  ): Promise<ServiceStatusResultDTO> {
    try {
      const queryBuilder =
        this.ServiceStatusRepository.createQueryBuilder('ServiceStatus');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('ServiceStatus.slug ILIKE :search', {
          search: `%${slugify(search, { lower: true })}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [ServiceStatus, totalElements] = await queryBuilder
        .orderBy('ServiceStatus.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...ServiceStatus],
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
    key: keyof ServiceStatusDTO;
    value: any;
  }) {
    try {
      const ServiceStatus =
        await this.ServiceStatusRepository.createQueryBuilder('ServiceStatus')
          .where({ [key]: value })
          .getOne();

      return ServiceStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findServiceStatusById(id: string): Promise<ServiceStatusEntity> {
    try {
      const ServiceStatus: ServiceStatusEntity =
        await this.ServiceStatusRepository.createQueryBuilder('ServiceStatus')
          .where({ id })
          // .leftJoinAndSelect('person.address', 'address')
          .getOne();
      return ServiceStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateServiceStatus(
    id: string,
    body: ServiceStatusUpdateDTO,
  ): Promise<UpdateResult> {
    const ServiceStatusToUpdate = await this.findServiceStatusById(id);

    if (!ServiceStatusToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }

    const updateData: Partial<ServiceStatusEntity> = {
      name: body.name,
      slug: slugify(body.name, { lower: true }),
    };

    return this.ServiceStatusRepository.update(id, updateData);
  }

  public async deleteServiceStatus(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const ServiceStatus: DeleteResult =
        await this.ServiceStatusRepository.softDelete(id);
      if (ServiceStatus.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return ServiceStatus;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
