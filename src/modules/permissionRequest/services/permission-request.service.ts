import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  PermissionRequestDTO,
  PermissionRequestResultDTO,
  PermissionRequestUpdateDTO,
} from '../dto/permission-request.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { PermissionTypeService } from 'src/modules/nomencladores/permissions-data/services/permissions-types.service';
import { PermissionRequestEntity } from '../entities/permission-request.entity';
import {
  FileOptionsDTO,
  FileOptionsToDeleteDTO,
} from 'src/modules/file/dto/file.dto';
import {
  FILE_ENTITY_NAMES,
  MODULES_NAMES,
  PERMISSION_REQUEST_STATUS,
} from 'src/constants/enums';
import { FileService } from 'src/modules/file/services/file.service';
import { Request } from 'express';
import { UsersService } from 'src/modules/users/services/users.service';
import { ROLES } from 'src/constants';
import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  endOfDay,
  startOfDay,
} from 'date-fns';

@Injectable()
export class PermissionRequestService {
  constructor(
    @InjectRepository(PermissionRequestEntity)
    private readonly permissionRequestRepository: Repository<PermissionRequestEntity>,
    private readonly permissionTypeService: PermissionTypeService,
    private readonly UserService: UsersService,
    private readonly fileServices: FileService,
  ) {}

  public async createPermission(
    body: PermissionRequestDTO,
    files: Express.Multer.File[],
    req: Request,
  ): Promise<PermissionRequestEntity | null> {
    try {
      const objPermissionType =
        await this.permissionTypeService.findPermissionTypeById(
          body.permissionType,
        );

      const timeUnits = { Horas: 1, Dias: 2, Meses: 3 };
      const timeInMillis = [3600000, 86400000, 2592000000];

      let requested_time = { time: body.time, unit: timeUnits[body.unitTime] };

      let allowed_time = {
        time: objPermissionType.maxiTimeAllowed,
        unit: timeUnits[objPermissionType.unitTime],
      };

      if (requested_time?.unit === 2) {
      }
      if (requested_time?.unit === 3) {
      }

      if (requested_time.unit === allowed_time.unit) {
        if (requested_time.time > allowed_time.time) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message:
              'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
          });
        }

        if (requested_time?.unit === 1) {
          const time = differenceInHours(body?.end_date, body?.start_date);
          if (time > allowed_time.time) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message:
                'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
            });
          }
        }
        if (requested_time?.unit === 2) {
          const time = differenceInDays(body?.end_date, body?.start_date);
          if (time > allowed_time.time) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message:
                'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
            });
          }
        }
        if (requested_time?.unit === 3) {
          const time = differenceInMonths(body?.end_date, body?.start_date);
          if (time > allowed_time.time) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message:
                'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
            });
          }
        }
      }

      if (requested_time.unit > allowed_time.unit) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message:
            'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
        });
      }

      const permissionRequest = new PermissionRequestEntity();
      permissionRequest.permissionType = objPermissionType || null;
      permissionRequest.start_date = body.start_date;
      permissionRequest.end_date = body.end_date;
      permissionRequest.observation = body.observation;
      permissionRequest.status = body.status;
      permissionRequest.time = body.time;
      permissionRequest.unitTime = body.unitTime;

      const user = await this.UserService.findUserById(req.idUser);

      permissionRequest.user = user;

      const permissionRequestCreated =
        await this.permissionRequestRepository.save(permissionRequest);
      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.PERMISSION_REQUEST,
          relationshipName: 'permissionRequest', //nombre de la relacion en la entidad File
          valueRelationship: permissionRequestCreated.id,
        };
        this.fileServices.createFile(files, optionsFiles);
      }

      return permissionRequestCreated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addFiles(id: string, files: Express.Multer.File[]) {
    try {
      const permissionRequest =
        await this.permissionRequestRepository.findOneBy({ id });

      if (!permissionRequest) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el permissionRequest',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: MODULES_NAMES.PERMISSION_REQUEST,
        relationshipName: 'permissionRequest',
        valueRelationship: permissionRequest.id,
      };
      return this.fileServices.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPermission(
    page: number,
    limit: number,
    req: Request,
  ): Promise<PermissionRequestResultDTO> {
    try {
      const queryBuilder =
        this.permissionRequestRepository.createQueryBuilder(
          'permissionRequest',
        );

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
          key !== 'start_date' &&
          key !== 'end_date'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `permissionRequest.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query?.start_date) {
        const date = new Date(`${req.query?.start_date}`);

        queryBuilder.andWhere({
          start_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query?.end_date) {
        const date = new Date(`${req.query?.end_date}`);

        queryBuilder.andWhere({
          end_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query.search) {
        query_string = query_string.concat(
          `${
            query_string ? ' AND ' : ''
          } permissionRequest.observation ILIKE '%${req.query.search}%'`,
        );
      }

      if (req.roleUser !== ROLES.ADMIN) {
        queryBuilder.andWhere('user.id = :id', { id: req.idUser });

        if (query_string) {
          queryBuilder.andWhere(query_string);
        }
      } else {
        if (query_string) {
          queryBuilder.andWhere(query_string);
        }
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [permissionRequest, totalElements] = await queryBuilder
        .leftJoinAndSelect('permissionRequest.files', 'files')
        .leftJoinAndSelect('permissionRequest.user', 'user')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .leftJoinAndSelect('permissionRequest.permissionType', 'permissionType')
        .orderBy('permissionRequest.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...permissionRequest],
      };
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof PermissionRequestDTO;
    value: any;
  }) {
    try {
      const Permission = await this.permissionRequestRepository
        .createQueryBuilder('permissionRequest')
        .leftJoinAndSelect('permissionRequest.permissionType', 'permissionType')
        .where({ [key]: value })
        .getOne();

      const files = await this.fileServices.findByEntityId(
        Permission.id,
        FILE_ENTITY_NAMES.PERMISSION_REQUEST,
      );

      Permission.files = files;

      return Permission;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPermissionById(
    id: string,
  ): Promise<PermissionRequestEntity> {
    try {
      const Permission: PermissionRequestEntity =
        await this.permissionRequestRepository
          .createQueryBuilder('permissionRequest')
          .leftJoinAndSelect(
            'permissionRequest.permissionType',
            'permissionType',
          )
          .where({ id })
          .getOne();

      const files = await this.fileServices.findByEntityId(
        Permission.id,
        FILE_ENTITY_NAMES.PERMISSION_REQUEST,
      );

      Permission.files = files;
      return Permission;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getUserPermissions(
    page: number,
    limit: number,
    user_id: string,
    req: Request,
  ) {
    try {
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const queryBuilder =
        this.permissionRequestRepository.createQueryBuilder(
          'permission_request',
        );

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
          key !== 'start_date' &&
          key !== 'end_date'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `permissionRequest.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query?.start_date) {
        const date = new Date(`${req.query?.start_date}`);

        queryBuilder.andWhere({
          start_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query?.end_date) {
        const date = new Date(`${req.query?.end_date}`);

        queryBuilder.andWhere({
          end_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query.search) {
        query_string = query_string.concat(
          `${
            query_string ? ' AND ' : ''
          } permissionRequest.observation ILIKE '%${req.query.search}%'`,
        );
      }

      const [Permissions, totalElements] = await queryBuilder
        .leftJoinAndSelect('permission_request.user', 'user')
        .leftJoinAndSelect(
          'permission_request.permissionType',
          'permissionType',
        )
        .leftJoinAndSelect('permission_request.files', 'files')
        .andWhere('user.id = :id', { id: user_id })
        .andWhere('permission_request.status != :statusDraft ', {
          statusDraft: PERMISSION_REQUEST_STATUS.DRAFT,
        })
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Permissions],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async validatePermission(
    permision_id: string,
    status: PERMISSION_REQUEST_STATUS,
  ) {
    try {
      await this.permissionRequestRepository.update(permision_id, {
        status: status,
      });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePermission(
    id: string,
    body: PermissionRequestUpdateDTO,
    files: Express.Multer.File[],
  ): Promise<UpdateResult | undefined> {
    try {
      const permissionRequestToUpdate =
        await this.permissionRequestRepository.findOne({
          where: { id },
        });
      const objPermissionType =
        await this.permissionTypeService.findPermissionTypeById(
          body.permissionType,
        );

        const timeUnits = { Horas: 1, Dias: 2, Meses: 3 };
        const timeInMillis = [3600000, 86400000, 2592000000];
  
        let requested_time = { time: body.time, unit: timeUnits[body.unitTime] };
  
        let allowed_time = {
          time: objPermissionType.maxiTimeAllowed,
          unit: timeUnits[objPermissionType.unitTime],
        };
  
        if (requested_time?.unit === 2) {
        }
        if (requested_time?.unit === 3) {
        }
  
        if (requested_time.unit === allowed_time.unit) {
          if (requested_time.time > allowed_time.time) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message:
                'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
            });
          }
  
          if (requested_time?.unit === 1) {
            const time = differenceInHours(body?.end_date, body?.start_date);
            if (time > allowed_time.time) {
              throw new ErrorManager({
                type: 'BAD_REQUEST',
                message:
                  'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
              });
            }
          }
          if (requested_time?.unit === 2) {
            const time = differenceInDays(body?.end_date, body?.start_date);
            if (time > allowed_time.time) {
              throw new ErrorManager({
                type: 'BAD_REQUEST',
                message:
                  'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
              });
            }
          }
          if (requested_time?.unit === 3) {
            const time = differenceInMonths(body?.end_date, body?.start_date);
            if (time > allowed_time.time) {
              throw new ErrorManager({
                type: 'BAD_REQUEST',
                message:
                  'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
              });
            }
          }
        }
  
        if (requested_time.unit > allowed_time.unit) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message:
              'El tiempo del permiso no puede ser mayor q el tiempo del tipo de permiso',
          });
        }

      if (!permissionRequestToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Solicitud de Permiso',
        });
      }

      permissionRequestToUpdate.permissionType = objPermissionType || null;
      permissionRequestToUpdate.start_date = body.start_date;
      permissionRequestToUpdate.end_date = body.end_date;
      permissionRequestToUpdate.observation = body.observation;
      permissionRequestToUpdate.status = body.status;
      permissionRequestToUpdate.time = body.time;
      permissionRequestToUpdate.unitTime = body.unitTime;

      const objUpdated = await this.permissionRequestRepository.update(
        id,
        permissionRequestToUpdate,
      );
      if (objUpdated.affected > 0 && files) {
        const options: FileOptionsDTO = {
          moduleName: MODULES_NAMES.PERMISSION_REQUEST,
          relationshipName: 'permissionRequest',
          valueRelationship: id,
        };
        await this.fileServices.deleteAndCreateFile(files, options);
      }
      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePermission(id: string): Promise<DeleteResult | undefined> {
    try {
      const options: FileOptionsToDeleteDTO = {
        relationshipName: 'permissionRequest',
        valueRelationship: id,
      };
      await this.fileServices.deleteFile(options);
      const Permission: DeleteResult =
        await this.permissionRequestRepository.softDelete(id);
      if (Permission.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Permission;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
