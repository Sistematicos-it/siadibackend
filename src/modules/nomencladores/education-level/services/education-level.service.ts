import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationLevelEntity } from '../entities/education-level.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  EducationLevelDTO,
  EducationLevelResultDTO,
  EducationLevelUpdateDTO,
} from '../dto/education-level.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class EducationLevelService {
  constructor(
    @InjectRepository(EducationLevelEntity)
    private readonly EducationLevelRepository: Repository<EducationLevelEntity>,
  ) {}

  public async createEducationLevel(
    body: EducationLevelDTO,
  ): Promise<EducationLevelEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }
      const objEducationLevel = new EducationLevelEntity();
      objEducationLevel.name = body.name;
      return await this.EducationLevelRepository.save(objEducationLevel);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEducationLevel(
    page: number,
    limit: number,
    search: string,
    req: Request,
  ): Promise<EducationLevelResultDTO> {
    try {
      const queryBuilder =
        this.EducationLevelRepository.createQueryBuilder('education_level');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `education_level.${key}`
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
        queryBuilder.andWhere('education_level.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [EducationLevel, totalElements] = await queryBuilder
        .orderBy('education_level.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...EducationLevel],
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
    key: keyof EducationLevelDTO;
    value: any;
  }) {
    try {
      const EducationLevel =
        await this.EducationLevelRepository.createQueryBuilder(
          'education_level',
        )
          .where({ [key]: value })
          .getOne();

      return EducationLevel;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEducationLevelById(
    id: string,
  ): Promise<EducationLevelEntity> {
    try {
      const EducationLevel: EducationLevelEntity =
        await this.EducationLevelRepository.createQueryBuilder(
          'education_level',
        )
          .where({ id })
          .getOne();
      return EducationLevel;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateEducationLevel(
    id: string,
    body: EducationLevelUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const EducationLevelToUpdate =
        await this.EducationLevelRepository.findOneBy({ id });

      if (!EducationLevelToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Nivel de Educacion',
        });
      }
      const updateData: Partial<EducationLevelEntity> = {
        name: body.name,
      };
      return await this.EducationLevelRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteEducationLevel(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.updateEducationLevel(id, {name: v4()})
      const EducationLevel: DeleteResult =
        await this.EducationLevelRepository.softDelete(id);
      if (EducationLevel.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return EducationLevel;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
