import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityLogsEntity } from '../entities/security.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SecurityDTO, SecurityResultDTO } from '../dto/security.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { UsersService } from 'src/modules/users/services/users.service';
import { AppDS } from 'src/config';
import { Request } from 'express';
import { PointService } from 'src/modules/points/services/point.service';
import { PointHistoryEntity } from 'src/modules/points/entities/point-history.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { SECURITY_ACTION } from '../interfaces/security.interface';
import { v4 } from 'uuid';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(SecurityLogsEntity)
    private readonly SecurityRepository: Repository<SecurityLogsEntity>,

    @InjectRepository(PointHistoryEntity)
    private readonly PointHistoryRepository: Repository<PointHistoryEntity>,

    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    private readonly UserService: UsersService,
  ) {}

  public async createSecurity(body: SecurityDTO): Promise<SecurityLogsEntity> {
    try {
      const user = await this.UserService.findUserById(body.user_id);

      const objSecurity = new SecurityLogsEntity();

      objSecurity.made_by = user;
      objSecurity.action = body.action;
      objSecurity.entity = body.entity;
      objSecurity.entry_id = body.entry_id;
      objSecurity.made_on = new Date();
      objSecurity.ip = body?.ip

      const security = await this.SecurityRepository.save(objSecurity);

      if (body.entity === 'point' && body.action === SECURITY_ACTION.EDIT) {
        const point = await this.PointRepository.findOne({
          where: { id: body.entry_id },
          relations: {
            beneficiary: true,
            facilitator_employee: true,
            coordinator_employee: true,
            manager_employee: true,
            technical_asistent_employee: true,
            address: true,
          },
        });

        const PointHistoryObjec: PointHistoryEntity = {
          ...point,
          history_id: v4(),
          changed_by: user,
          security: security,
          changedAt: objSecurity.made_on,
        };

        PointHistoryObjec.address = point.address
        PointHistoryObjec.beneficiary = point.beneficiary
        PointHistoryObjec.coordinator_employee = point.coordinator_employee
        PointHistoryObjec.manager_employee = point.manager_employee
        PointHistoryObjec.technical_asistent_employee = point.technical_asistent_employee
        PointHistoryObjec.facilitator_employee = point.facilitator_employee

        await this.PointHistoryRepository.save(PointHistoryObjec);
      }

      return security;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findSecurity(
    page: number,
    limit: number,
    req: Request,
  ): Promise<SecurityResultDTO> {
    try {
      const queryBuilder =
        this.SecurityRepository.createQueryBuilder('security_logs');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'search' &&
          key !== 'createdAt'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `security_logs.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.createdAt) {
        const date = new Date(String(req.query.createdAt));
        queryBuilder.where('security_logs.createdAt = :date', { date });
      }

      if (query_string) {
        queryBuilder.where(query_string);
        if (req.query.createdAt) {
          const date = new Date(String(req.query.createdAt));
          queryBuilder.andWhere('security_logs.createdAt = :date', { date });
        }
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Security, totalElements] = await queryBuilder
        .leftJoinAndSelect('security_logs.made_by', 'made_by')
        .orderBy('security_logs.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Security],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof SecurityDTO; value: any }) {
    try {
      const Security = await this.SecurityRepository.createQueryBuilder(
        'security_logs',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('security_logs.made_by', 'made_by')
        .getOne();

      const conn_pool = await AppDS.initialize();

      const entity_field = await conn_pool.query(
        `SELECT * FROM ${Security.entity} WHERE id = $1`,
        [Security.entry_id],
      );

      await conn_pool.destroy();
      return { ...Security, entity_field };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSecurityById(id: string) {
    try {
      const Security: SecurityLogsEntity =
        await this.SecurityRepository.createQueryBuilder('security_logs')
          .leftJoinAndSelect('security_logs.made_by', 'made_by')
          .where({ id })
          .getOne();

      const conn_pool = await AppDS.initialize();

      let entity_field: any;
      if (Security.entity) {
        entity_field = await conn_pool.query(
          `SELECT * FROM ${Security.entity} WHERE id = $1`,
          [Security.entry_id],
        );
      }

      await conn_pool.destroy();
      return { ...Security, entity_field };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSecurityByEntityNameAndId(entityName: string, entityId: string) {
    try {
      // Consulta para obtener todos los registros de seguridad relacionados con el entry_id y el entity_name
      const SecurityLogs: SecurityLogsEntity[] =
        await this.SecurityRepository.createQueryBuilder('security_logs')
          .leftJoinAndSelect('security_logs.made_by', 'made_by')
          .where('security_logs.entry_id = :entityId', { entityId })
          .andWhere('security_logs.entity = :entityName', { entityName }) // Filtra por entity_name
          .getMany(); // Obtiene múltiples registros relacionados con el entry_id y el entity_name
  
      return SecurityLogs; // Devuelve los registros obtenidos de security_logs
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
