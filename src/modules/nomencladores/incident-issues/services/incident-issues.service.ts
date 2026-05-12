import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncidentIssuesEntity } from '../entities/incident-issues.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  IncidentIssuesDTO,
  IncidentIssuesResultDTO,
  IncidentIssuesUpdateDTO,
} from '../dto/incident-issues.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';

@Injectable()
export class IncidentIssuesService {
  constructor(
    @InjectRepository(IncidentIssuesEntity)
    private readonly incidentIssuesRepository: Repository<IncidentIssuesEntity>,
  ) {}

  public async createIncidentIssues(
    body: IncidentIssuesDTO,
  ): Promise<IncidentIssuesEntity> {
    try {
      return await this.incidentIssuesRepository.save(body);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findIncidentIssues(
    page: number,
    limit: number,
    req: Request
  ): Promise<IncidentIssuesResultDTO> {
    try {
      const queryBuilder =
        this.incidentIssuesRepository.createQueryBuilder('incidentIssues');

        let query_string = '';

        const filters = req.query;
  
        const keys = Object.keys(filters);
  
        const values = Object.values(filters);
  
        let realIndex = 0
        keys.forEach((key, i) => {
          if (key !== 'page' && key !== 'limit' && key !== 'search') {
            query_string = query_string.concat(
              `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `incidentIssues.${key}`}='${values[i]}'`,
            );
            realIndex++
          }
        });
  
        if (req.query.search) {
          query_string = query_string.concat(
            `${query_string ? ' AND ' : ''} incidentIssues.name ILIKE '%${req.query.search}%'`,
          );
        }
  
         if (query_string) {
            queryBuilder.where(query_string);
          }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [IncidentIssues, totalElements] = await queryBuilder
        .orderBy('incidentIssues.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...IncidentIssues],
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
    key: keyof IncidentIssuesDTO;
    value: any;
  }) {
    try {
      const IncidentIssues =
        await this.incidentIssuesRepository.createQueryBuilder('incidentIssues')
          .where({ [key]: value })
          .getOne();

      return IncidentIssues;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findIncidentIssuesById(
    id: string,
  ): Promise<IncidentIssuesEntity> {
    try {
      const IncidentIssues: IncidentIssuesEntity =
        await this.incidentIssuesRepository.createQueryBuilder('incidentIssues')
          .where({ id })
          .getOne();
      return IncidentIssues;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateIncidentIssues(
    id: string,
    body: IncidentIssuesUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const incidentIssuesToUpdate =
        await this.incidentIssuesRepository.findOneBy({ id });

      if (!incidentIssuesToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }
      return await this.incidentIssuesRepository.update(id, body);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteIncidentIssues(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const incidentIssues: DeleteResult =
        await this.incidentIssuesRepository.softDelete(id);
      if (incidentIssues.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return incidentIssues;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
