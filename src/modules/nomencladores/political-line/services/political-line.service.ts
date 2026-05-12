import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PoliticalLineEntity } from '../entities/political-line.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  PoliticalLineDTO,
  PoliticalLineResultDTO,
  PoliticalLineUpdateDTO,
} from '../dto/political-line.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class PoliticalLineService {
  constructor(
    @InjectRepository(PoliticalLineEntity)
    private readonly PoliticalLineRepository: Repository<PoliticalLineEntity>,
  ) {}

  public async createPoliticalLine(
    body: PoliticalLineDTO,
  ): Promise<PoliticalLineEntity> {
    try {

      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }

      const objPoliticalLine = new PoliticalLineEntity();
      objPoliticalLine.name = body.name;
      return await this.PoliticalLineRepository.save(objPoliticalLine);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPoliticalLine(
    page: number,
    limit: number,
    search: string,
    req: Request
  ): Promise<PoliticalLineResultDTO> {
    try {
      const queryBuilder =
        this.PoliticalLineRepository.createQueryBuilder('political_line');

        let query_string = '';

        const filters = req.query;
  
        const keys = Object.keys(filters);
  
        const values = Object.values(filters);
  
        let realIndex = 0;
        keys.forEach((key, i) => {
          if (key !== 'page' && key !== 'limit' && key !== 'search') {
            query_string = query_string.concat(
              `${realIndex !== 0 ? ' AND ' : ''}${
                key.split('.').length > 1 ? key : `political_line.${key}`
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
          queryBuilder.andWhere('political_line.name ILIKE :search', {
            search: `%${search}%`,
          });
        }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [PoliticalLine, totalElements] = await queryBuilder
        .orderBy('political_line.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...PoliticalLine],
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
    key: keyof PoliticalLineDTO;
    value: any;
  }) {
    try {
      const PoliticalLine =
        await this.PoliticalLineRepository.createQueryBuilder('political_line')
          .where({ [key]: value })
          .getOne();

      return PoliticalLine;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPoliticalLineById(
    id: string,
  ): Promise<PoliticalLineEntity> {
    try {
      const PoliticalLine: PoliticalLineEntity =
        await this.PoliticalLineRepository.createQueryBuilder('political_line')
          .where({ id })
          .getOne();
      return PoliticalLine;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePoliticalLine(
    id: string,
    body: PoliticalLineUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const PoliticalLineToUpdate =
        await this.PoliticalLineRepository.findOneBy({ id });

      if (!PoliticalLineToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Linea Politica',
        });
      }
      const updateData: Partial<PoliticalLineEntity> = {
        name: body.name,
      };
      return await this.PoliticalLineRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePoliticalLine(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {

      await this.PoliticalLineRepository.update(id, {name: v4()})

      const PoliticalLine: DeleteResult =
        await this.PoliticalLineRepository.softDelete(id);
      if (PoliticalLine.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return PoliticalLine;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
