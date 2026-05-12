import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpecializationEntity } from '../entities/specialization.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  SpecializationDTO,
  SpecializationResultDTO,
  SpecializationUpdateDTO,
} from '../dto/specialization.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 } from 'uuid';

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(SpecializationEntity)
    private readonly SpecializationRepository: Repository<SpecializationEntity>,
  ) {}

  public async createSpecialization(
    body: SpecializationDTO,
  ): Promise<SpecializationEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }
      const objSpecialization = new SpecializationEntity();
      objSpecialization.name = body.name;
      return await this.SpecializationRepository.save(objSpecialization);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findSpecialization(
    page: number,
    limit: number,
    search: string,
  ): Promise<SpecializationResultDTO> {
    try {
      const queryBuilder =
        this.SpecializationRepository.createQueryBuilder('specialization');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('specialization.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Specialization, totalElements] = await queryBuilder
        .orderBy('specialization.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Specialization],
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
    key: keyof SpecializationDTO;
    value: any;
  }) {
    try {
      const Specialization =
        await this.SpecializationRepository.createQueryBuilder('specialization')
          .where({ [key]: value })
          .getOne();

      return Specialization;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSpecializationById(
    id: string,
  ): Promise<SpecializationEntity> {
    try {
      const Specialization: SpecializationEntity =
        await this.SpecializationRepository.createQueryBuilder('specialization')
          .where({ id })
          .getOne();
      return Specialization;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateSpecialization(
    id: string,
    body: SpecializationUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {

      const exists = await this.findBy({key: 'name', value: body?.name})

      
      const SpecializationToUpdate =
        await this.SpecializationRepository.findOneBy({ id });

      if (!SpecializationToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Especializacion',
        });
      }

      if(exists?.id !== SpecializationToUpdate?.id){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }
      const updateData: Partial<SpecializationEntity> = {
        name: body.name,
      };
      return await this.SpecializationRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteSpecialization(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.SpecializationRepository.update(id, {name: v4()})
      const Specialization: DeleteResult =
        await this.SpecializationRepository.softDelete(id);
      if (Specialization.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Specialization;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
