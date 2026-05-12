import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstitutionEntity } from '../entities/institution.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  InstitutionDTO,
  InstitutionResultDTO,
  InstitutionUpdateDTO,
} from '../dto/institution.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(InstitutionEntity)
    private readonly InstitutionRepository: Repository<InstitutionEntity>,
  ) {}

  public async createInstitution(
    body: InstitutionDTO,
  ): Promise<InstitutionEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }
      const objInstitution = new InstitutionEntity();
      objInstitution.name = body.name;
      return await this.InstitutionRepository.save(objInstitution);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findInstitution(
    page: number,
    limit: number,
    search: string,
    req: Request
  ): Promise<InstitutionResultDTO> {
    try {
      const queryBuilder =
        this.InstitutionRepository.createQueryBuilder('institution');

        let query_string = '';

        const filters = req.query;
  
        const keys = Object.keys(filters);
  
        const values = Object.values(filters);
  
        let realIndex = 0;
        keys.forEach((key, i) => {
          if (key !== 'page' && key !== 'limit' && key !== 'search') {
            query_string = query_string.concat(
              `${realIndex !== 0 ? ' AND ' : ''}${
                key.split('.').length > 1 ? key : `institution.${key}`
              }='${values[i]}'`,
            );
            realIndex++;
          }
        });
  
        if (query_string) {
          queryBuilder.andWhere(query_string);
        }

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.andWhere('institution.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Institution, totalElements] = await queryBuilder
        .orderBy('institution.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Institution],
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
    key: keyof InstitutionDTO;
    value: any;
  }) {
    try {
      const Institution =
        await this.InstitutionRepository.createQueryBuilder('institution')
          .where({ [key]: value })
          .getOne();

      return Institution;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findInstitutionById(
    id: string,
  ): Promise<InstitutionEntity> {
    try {
      const Institution: InstitutionEntity =
        await this.InstitutionRepository.createQueryBuilder('institution')
          .where({ id })
          .getOne();
      return Institution;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateInstitution(
    id: string,
    body: InstitutionUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      
      const InstitutionToUpdate =
        await this.InstitutionRepository.findOneBy({ id });

      if (!InstitutionToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }

      if(exists?.id !== InstitutionToUpdate?.id){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }
      const updateData: Partial<InstitutionEntity> = {
        name: body.name,
      };
      return await this.InstitutionRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteInstitution(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.InstitutionRepository.update(id, {name: v4()})
      const Institution: DeleteResult =
        await this.InstitutionRepository.softDelete(id);
      if (Institution.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Institution;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
