import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionLogsEntity } from '../entities/connection-logs.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  ConnectionLogsDTO,
  ConnectionLogsResultDTO,
  ConnectionLogsUpdateDTO,
} from '../dto/connection-logs.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { Request } from 'express';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { MODULES_NAMES } from 'src/constants/enums';
import { FileService } from 'src/modules/file/services/file.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { PointService } from 'src/modules/points/services/point.service';

@Injectable()
export class ConnectionLogsService {
  constructor(
    @InjectRepository(ConnectionLogsEntity)
    private readonly connectionLogsRepository: Repository<ConnectionLogsEntity>,

    private readonly fileServices: FileService,
    private readonly userService: UsersService,
    private readonly pdeService: PointService,
  ) {}

  public async createConnectionLogs(idUser: string, files: Express.Multer.File[]): Promise<ConnectionLogsEntity> {
    try {
      
      if (files) {
        const user = await this.userService.findUserById(idUser);
        let objPoint = null
        if (!user) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se ha encontrado el usuario',
          });
        }

        if (!user.employee) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El usuario seleccionado no es un empleado.',
          });
        }

        if (user.employee) {
          const point = await this.pdeService.getPointByFacilitator(user.employee.id);
          console.log(point);
          
          if (!point) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message: 'El empleado seleccionado no tiene un punto de encuentro asociado.',
            });
          }
          objPoint = point
        }

        for (const file of files) {
          const jsonContent = JSON.parse(file.buffer.toString('utf-8'));
          // Aquí puedes procesar la información del JSON según tus necesidades

          const objConnectionLogs = new ConnectionLogsEntity();
          objConnectionLogs.point = objPoint ? objPoint : null;

          objConnectionLogs.sent = jsonContent.sent || 0;
          objConnectionLogs.received = jsonContent.received || 0;
          objConnectionLogs.lost = jsonContent.lost || 0;
          objConnectionLogs.loss_percentage = jsonContent.loss_percentage ? parseFloat(jsonContent.loss_percentage.toFixed(2)) : 0
          objConnectionLogs.host = jsonContent.host;

          if (jsonContent.timestamp) {
            const year = parseInt(jsonContent.timestamp.substring(0, 4));
            const month = parseInt(jsonContent.timestamp.substring(4, 6)) - 1; // Los meses en JavaScript son base 0 (enero es 0)
            const day = parseInt(jsonContent.timestamp.substring(6, 8));
            const hour = parseInt(jsonContent.timestamp.substring(9, 11));
            const minute = parseInt(jsonContent.timestamp.substring(11, 13));
            const second = parseInt(jsonContent.timestamp.substring(13, 15));
  
            // Crear el objeto Date
            objConnectionLogs.timestamp = new Date(year, month, day, hour, minute, second);
          }
          const conecctions = await this.connectionLogsRepository.save(objConnectionLogs);

          const optionsFiles: FileOptionsDTO = {
            moduleName: MODULES_NAMES.CONNECTION_LOGS,
            relationshipName: 'conecctionsLogs',
            valueRelationship: conecctions.id,
          };
          this.fileServices.createFile([file], optionsFiles);
          return conecctions
        }
      }
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateConnectionLogs(
    id: string,
    body: ConnectionLogsUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ConnectionLogsToUpdate = await this.connectionLogsRepository.findOneBy({
        id,
      });

      if (!ConnectionLogsToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }
      const updateData: Partial<ConnectionLogsEntity> = {
        sent: body.sent,
        received: body.received,
        lost: body.lost,
        loss_percentage: body.loss_percentage ? parseFloat(body.loss_percentage.toFixed(2)) : 0,
        host: body.host,
        timestamp: body.timestamp,
      };
      return await this.connectionLogsRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findConnectionLogs(
    page: number,
    limit: number,
    req: Request,
  ): Promise<ConnectionLogsResultDTO> {
    try {
      const queryBuilder =
        this.connectionLogsRepository.createQueryBuilder('connectionLogs');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `connectionLogs.${key}`}='${values[i]}'`,
          );
          realIndex++
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} connectionLogs.name ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [ConnectionLogs, totalElements] = await queryBuilder
        .leftJoinAndSelect('connectionLogs.point', 'point')
        .orderBy('connectionLogs.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...ConnectionLogs],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ConnectionLogsDTO; value: any }) {
    try {
      const ConnectionLogs = await this.connectionLogsRepository
        .createQueryBuilder('connectionLogs')
        .where({ [key]: value })
        .getOne();

      return ConnectionLogs;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findConnectionLogsById(id: string): Promise<ConnectionLogsEntity> {
    try {
      const ConnectionLogs: ConnectionLogsEntity = await this.connectionLogsRepository
        .createQueryBuilder('connectionLogs')
        .where({ id })
        .getOne();
      return ConnectionLogs;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findConnectionLogsByIds(ids: string[]): Promise<ConnectionLogsEntity[]> {
    try {
      return await this.connectionLogsRepository.findBy({ id: In(ids) });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteConnectionLogs(id: string): Promise<DeleteResult | undefined> {
    try {
      const ConnectionLogs: DeleteResult = await this.connectionLogsRepository.softDelete(
        id,
      );
      if (ConnectionLogs.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return ConnectionLogs;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
