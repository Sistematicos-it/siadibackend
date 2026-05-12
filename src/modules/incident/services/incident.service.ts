import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncidentEntity } from '../entities/incident.entity';
import {
  DeleteResult,
  Repository,
  UpdateResult,
  FindOptions,
  Between,
  In,
} from 'typeorm';
import {
  DisconnectionIncidentDTO,
  DisconnectionIncidentUpdateDTO,
  GetIncidentResultDTO,
  IncidentDTO,
  IncidentLogsDTO,
  IncidentReportDTO,
  IncidentResultDTO,
  IncidentUpdateDTO,
  ReportGetIncidentDTO,
} from '../dto/incident.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { IncidentLogsEntity } from '../entities/incident-logs.entity';
import { IncidentAssetsEntity } from '../entities/incident-assets.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import {
  FILE_ENTITY_NAMES,
  INCIDENT_EMPLOYEE_TYPE,
  MODULES_NAMES,
  POINT_STATUS,
  SUPPORT_TYPE,
  TICKET_TYPE,
  TYPE_OF_INCIDENT,
} from 'src/constants/enums';
import { EmployeeCommandChainEntity } from 'src/modules/employee/entities/employee_command_chain.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ROLES } from 'src/constants';
import { DisconnectionIncidentEntity } from '../entities/disconnection-incident.entity';
import { IncidentIssuesService } from 'src/modules/nomencladores/incident-issues/services/incident-issues.service';
import { Request } from 'express';
import { endOfDay, format, startOfDay } from 'date-fns';
import { PointStatusService } from 'src/modules/nomencladores/point-status/services/point-status.service';
import { PointStatusEntity } from 'src/modules/nomencladores/point-status/entities/point-status.entity';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { PointService } from 'src/modules/points/services/point.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { ParishService } from 'src/modules/nomencladores/geolocation/services/parish.service';
import { CantonService } from 'src/modules/nomencladores/geolocation/services/canton.service';
import { ProvinceService } from 'src/modules/nomencladores/geolocation/services/province.service';
import { AssetService } from 'src/modules/asset/services/asset.service';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ParishEntity } from 'src/modules/nomencladores/geolocation/entities/parish.entity';
import { CantonEntity } from 'src/modules/nomencladores/geolocation/entities/canton.entity';
import { ProvinceEntity } from 'src/modules/nomencladores/geolocation/entities/province.entity';
import { EmailService } from 'src/modules/email/services/email.service';

@Injectable()
export class IncidentService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly IncidentRepository: Repository<IncidentEntity>,

    @InjectRepository(DisconnectionIncidentEntity)
    private readonly DisconnectionIncidentRepository: Repository<DisconnectionIncidentEntity>,

    @InjectRepository(IncidentLogsEntity)
    private readonly IncidentLogsRepository: Repository<IncidentLogsEntity>,

    @InjectRepository(IncidentAssetsEntity)
    private readonly IncidentAssetsRepository: Repository<IncidentAssetsEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly EmployeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(EmployeeCommandChainEntity)
    private readonly CommandChainRepository: Repository<EmployeeCommandChainEntity>,

    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    @InjectRepository(AssetEntity)
    private readonly AssetRepository: Repository<AssetEntity>,

    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,

    @InjectRepository(ParishEntity)
    private readonly parishRepository: Repository<ParishEntity>,

    @InjectRepository(CantonEntity)
    private readonly cantonRepository: Repository<CantonEntity>,

    // @InjectRepository(ProvinceEntity)
    // private readonly provinceRepository: Repository<ProvinceEntity>,

    private readonly IncidentIssuesService: IncidentIssuesService,
    private readonly fileServices: FileService,
    private readonly PointStatusService: PointStatusService,
    private readonly SecurityService: SecurityService,
    private readonly pointService: PointService,

    // private readonly addressService: AddressService,
    // private readonly parishService: ParishService,
    // private readonly cantonService: CantonService,
    // private readonly provinceService: ProvinceService,
    private readonly AssetService: AssetService,
    private readonly EmailService: EmailService,
  ) {}

  public async createIncident(
    user_id: string,
    body: IncidentDTO,
    files: Express.Multer.File[],
    ip: string,
  ): Promise<IncidentEntity> {
    try {
      const assets = body.assets;
      delete body.assets;
      const objIncident: Partial<IncidentEntity> = { ...body };

      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      objIncident.requester = employee;

      const issue = await this.IncidentIssuesService.findIncidentIssuesById(
        body.issue.id,
      );
      objIncident.issue=issue;

      console.log(issue);

      const point = await this.PointRepository.createQueryBuilder('point')
        .leftJoin('point.facilitator_employee', 'facilitator_employee')
        .leftJoinAndSelect(
          'point.technical_asistent_employee',
          'technical_asistent_employee',
        )
        .where('facilitator_employee.id = :id', { id: employee.id })
        .getOne();

      objIncident.point = point;

      if (!point) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: `Usted no se encuentra asociado a un punto del encuentro`,
        });
      }
      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.TECHNICALASSISTAN) {
        const tech_assistent = point.technical_asistent_employee;

        objIncident.assigned_to = tech_assistent;
      }

      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.MANAGER) {
        const commandChain =
          await this.CommandChainRepository.createQueryBuilder(
            'employee_command_chain',
          )
            .leftJoinAndSelect('employee_command_chain.boss', 'boss')
            .leftJoin('employee_command_chain.subordinate', 'subordinate')
            .where('subordinate.id = :id', { id: employee.id })
            .getOne();

        objIncident.assigned_to = commandChain.boss;
      }

      const Incident = await this.IncidentRepository.save(objIncident);

      assets?.forEach(async (asset) => {
        const _asset = await this.AssetRepository.findOne({
          where: { id: asset.id },
        });
        console.log(asset);
        const objAsset = new IncidentAssetsEntity();

        objAsset.asset = _asset;
        objAsset.incident = Incident;

        const saved = await this.IncidentAssetsRepository.save(objAsset);
        console.log(saved.asset);
      });

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.INCIDENT,
          relationshipName: 'incident',
          valueRelationship: Incident.id,
        };
        this.fileServices.createFile(files, optionsFiles);
      }

      const incident_number = String(Incident.incident_number);

      let fill = '';
      const fill_amount = 7 - incident_number.length;

      for (let i = 0; i < fill_amount; i++) {
        fill = fill + '0';
      }

      const incident_code = `SMI${fill}${incident_number}`;

      await this.IncidentRepository.update(Incident.id, { incident_code });

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'incident',
        entry_id: Incident.id,
        ip,
      });
      //notificar registro del incidente
      await this.EmailService.sendIncidentEmail(Incident);
      return Incident;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async reportGetDeliveryCertificate(payload: ReportGetIncidentDTO) {
    console.log(payload);
    try {
      if (!payload.idIncident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El id de incidente es obligatorio',
        });
      }

      if (!payload.supportType) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El tipo de soporte de incidente es obligatorio',
        });
      }

      if (!payload.deliveryCertificateNumber) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El numero de acta de incidente es obligatorio',
        });
      }
      const incident = await this.IncidentRepository.findOneOrFail({
        where: { id: payload.idIncident },
        relations: [
          'point.address',
          'point.address.parish',
          'point.address.parish.canton',
          'point.address.parish.canton.province',
          'requester',
          'assigned_to',
          'issue',
          'logs',
          'logs.made_by',
          // 'planning',
          // 'planningAdvanced',
        ],
      });

      if (incident.point) {
        const point = await this.PointRepository.findOne({
          where: {
            id: incident.point.id,
          },
          relations: [
            'address',
            'address.parish',
            'address.parish.canton',
            'address.parish.canton.province',
          ],
        });
        incident.point = point;
      }

      if (incident.requester) {
        const requester = await this.EmployeeRepository.findOneBy({
          id: incident.requester.id,
        });
        incident.requester = requester;
      }

      if (incident.assigned_to) {
        const assignedTo = await this.EmployeeRepository.findOneBy({
          id: incident.assigned_to.id,
        });
        incident.assigned_to = assignedTo;
      }

      let formattedTime: any = null;
      if (incident.solved_date) {
        const resolvedDate = new Date(incident.solved_date);
        const createdDate = incident.createdAt;
        const timeToResolve = resolvedDate.getTime() - createdDate.getTime();

        const millisecondsPerSecond = 1000;
        const millisecondsPerMinute = 60 * millisecondsPerSecond;
        const millisecondsPerHour = 60 * millisecondsPerMinute;
        const millisecondsPerDay = 24 * millisecondsPerHour;

        const days = Math.floor(timeToResolve / millisecondsPerDay);
        const hours = Math.floor(
          (timeToResolve % millisecondsPerDay) / millisecondsPerHour,
        );
        const minutes = Math.floor(
          (timeToResolve % millisecondsPerHour) / millisecondsPerMinute,
        );
        const seconds = Math.floor(
          (timeToResolve % millisecondsPerMinute) / millisecondsPerSecond,
        );

        formattedTime = `${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`;
      }

      return {
        ...incident,
        timeToResolve: formattedTime,
        supportType: payload.supportType,
        deliveryCertificateNumber: payload.deliveryCertificateNumber,
      };
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getAssignedEmployee(user_id: string, issue_id: string) {
    try {
      let assigned_employee: EmployeeEntity;
      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      const issue = await this.IncidentIssuesService.findIncidentIssuesById(
        issue_id,
      );

      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.TECHNICALASSISTAN) {
        const point = await this.PointRepository.createQueryBuilder('point')
          .leftJoin('point.facilitator_employee', 'facilitator_employee')
          .leftJoinAndSelect(
            'point.technical_asistent_employee',
            'technical_asistent_employee',
          )
          .where('facilitator_employee.id = :id', { id: employee.id })
          .getOne();

        assigned_employee = point.technical_asistent_employee;
      }

      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.MANAGER) {
        const commandChain =
          await this.CommandChainRepository.createQueryBuilder(
            'employee_command_chain',
          )
            .leftJoinAndSelect('employee_command_chain.boss', 'boss')
            .leftJoin('employee_command_chain.subordinate', 'subordinate')
            .where('subordinate.id = :id', { id: employee.id })
            .getOne();

        assigned_employee = commandChain?.boss;
      }

      return assigned_employee;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createDisconnectionIncident(
    user_id: string,
    body: DisconnectionIncidentDTO,
    files: Express.Multer.File[],
    ip: string,
  ): Promise<DisconnectionIncidentEntity> {
    try {
      const objIncident = new DisconnectionIncidentEntity();

      objIncident.observation = body.observation;

      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      objIncident.requester = employee;
      const point = await this.PointRepository.createQueryBuilder('point')
        .leftJoinAndSelect(
          'point.technical_asistent_employee',
          'technical_asistent_employee',
        )
        .where('point.id = :id', { id: body.point })
        .getOne();

      const tech_assistent = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .where('employee.id = :id', {
          id: point.technical_asistent_employee.id,
        })
        .getOne();

      objIncident.assigned_to = tech_assistent;
      objIncident.point = point;

      const Incident = await this.DisconnectionIncidentRepository.save(
        objIncident,
      );

      const status_suspended = await this.PointStatusService.findBy({
        key: 'name',
        value: POINT_STATUS.SUSPENDED,
      });
      const status_inactive = await this.PointStatusService.findBy({
        key: 'name',
        value: POINT_STATUS.UNNACTIVE,
      });

      let final_status: PointStatusEntity;

      if (point?.facilitator_employee) {
        final_status = status_suspended;
      } else {
        final_status = status_inactive;
      }

      const pointStatusChanged = await this.PointRepository.update(point.id, {
        status: final_status,
      });

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.INCIDENT,
          relationshipName: 'incident',
          valueRelationship: Incident.id,
        };
        this.fileServices.createFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'disconnection_incident',
        entry_id: Incident.id,
        ip,
      });

      return Incident;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findDisconnectionIncident(
    page: number,
    limit: number,
    user_id: string,
    req: Request,
  ) {
    try {
      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .andWhere('user.id = :id', { id: user_id })
        .getOne();

      const queryBuilder =
        this.DisconnectionIncidentRepository.createQueryBuilder(
          'disconnection_incident',
        );

      if (employee?.user_type === ROLES.FACILITATOR) {
        const point = await this.PointRepository.createQueryBuilder('point')
          .leftJoin('point.facilitator_employee', 'facilitator_employee')
          .andWhere('facilitator_employee.id = :id', { id: employee.id })
          .getOne();

        queryBuilder.andWhere('point.id = :id', { id: point.id });
      }

      if (employee?.user_type === ROLES.TECHNICAL_ASSISTENT) {
        queryBuilder.andWhere('assigned_to.id = :id', { id: employee.id });
      }

      if (
        employee?.user_type === ROLES.MANAGER ||
        employee?.user_type === ROLES.COORDINATOR
      ) {
        queryBuilder.andWhere('requester.id = :id', { id: employee.id });
      }
      if (employee?.user_type === ROLES.MANAGER) {
        const commandChain = await this.CommandChainRepository.find({
          where: {
            subordinate: employee,
          },
          relations: {
            boss: true,
            subordinate: true,
          },
        });

        let ids = commandChain?.map((e) => e?.boss?.id);

        if (ids?.length > 0) {
          queryBuilder.orWhere('requester.id IN (:...ids)', { ids });
        }
      }

      if (employee?.user_type === ROLES.COORDINATOR) {
        const commandChain = await this.CommandChainRepository.find({
          where: {
            boss: employee,
          },
          relations: {
            boss: true,
            subordinate: true,
          },
        });

        let ids = commandChain?.map((e) => e?.subordinate?.id);

        if (ids?.length > 0) {
          queryBuilder.orWhere('requester.id IN (:...ids)', { ids });
        }
      }

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
          key !== 'status'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `disconnection_incident.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
        if (key === 'status') {
          console.log(key);
          console.log(values[i]);
          const str = `${
            query_string
              ? ` AND ${
                  values[i] === 'Activo'
                    ? `solved_date IS NULL AND closed_date IS NULL`
                    : `solved_date IS NOT NULL `
                }`
              : `${
                  values[i] === 'Activo'
                    ? `solved_date IS NULL AND closed_date IS NULL`
                    : `solved_date IS NOT NULL `
                }`
          }`;
          console.log(str);
          query_string += str;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${
            query_string ? ' AND ' : ''
          } disconnection_incident.observation ILIKE '%${req.query.search}%'`,
        );
      }

      console.log(query_string);
      if (query_string) {
        if (
          employee?.user_type === ROLES.FACILITATOR ||
          employee?.user_type === ROLES.COORDINATOR ||
          employee?.user_type === ROLES.MANAGER ||
          employee?.user_type === ROLES.TECHNICAL_ASSISTENT
        ) {
          queryBuilder.andWhere(query_string);
        } else {
          queryBuilder.where(query_string);
        }
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [Incident, totalElements] = await queryBuilder
        .leftJoinAndSelect('disconnection_incident.requester', 'requester')
        .leftJoinAndSelect('disconnection_incident.assigned_to', 'assigned_to')
        .leftJoinAndSelect('disconnection_incident.point', 'point')
        .orderBy('disconnection_incident.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Incident],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addFilesToIncident(id: string, files: Express.Multer.File[]) {
    try {
      const Incident = await this.IncidentRepository.findOneBy({ id });

      if (!Incident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el incidente',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: 'incident',
        relationshipName: 'incident',
        valueRelationship: Incident.id,
      };
      this.fileServices.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async registerIncidentLogs(
    id: string,
    body: IncidentLogsDTO,
    req: Request,
  ) {
    try {
      const Incident = await this.IncidentRepository.findOneBy({ id });

      const employee = await this.EmployeeRepository.findOne({
        where: { user: { id: req.idUser } },
        relations: { user: true },
      });

      if (!Incident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la incidente',
        });
      }

      const objLog = new IncidentLogsEntity();

      objLog.details = body.details;

      objLog.incident = Incident;
      objLog.made_by = employee;

      return await this.IncidentLogsRepository.save(objLog);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async registerDisconnectionIncidentLogs(
    id: string,
    body: IncidentLogsDTO,
    req: Request,
  ) {
    try {
      const Incident = await this.DisconnectionIncidentRepository.findOneBy({
        id,
      });

      const employee = await this.EmployeeRepository.findOne({
        where: { user: { id: req.idUser } },
        relations: { user: true },
      });

      if (!Incident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la incidente',
        });
      }

      const objLog = new IncidentLogsEntity();

      objLog.details = body.details;

      objLog.disconnection_incident = Incident;
      objLog.made_by = employee;

      return await this.IncidentLogsRepository.save(objLog);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateIncidentLogs(id: string, body: IncidentLogsDTO) {
    try {
      const IncidentLog = await this.IncidentLogsRepository.findOneBy({ id });

      if (!IncidentLog) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la incidente',
        });
      }

      const objLog: Partial<IncidentLogsEntity> = { details: body.details };

      return await this.IncidentLogsRepository.update(id, objLog);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async markAsSolved(id: string, type: TICKET_TYPE) {
    try {
      if (type === TICKET_TYPE.REGULAR) {
        const Incident = await this.IncidentRepository.findOneBy({ id });

        if (!Incident) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se pudo encontrar la incidente',
          });
        }

        const updateData: Partial<IncidentEntity> = {
          solved_date: new Date(), //Cambiar a ISO string
        };

        return await this.IncidentRepository.update(id, updateData);
      }

      if (type === TICKET_TYPE.DISCONNECTION) {
        const Incident = await this.DisconnectionIncidentRepository.findOne({
          where: {
            id,
          },
          relations: { point: true },
        });

        if (!Incident) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se pudo encontrar la incidente',
          });
        }

        const updateData: Partial<DisconnectionIncidentEntity> = {
          solved_date: new Date(),
        };

        const updated = await this.DisconnectionIncidentRepository.update(
          id,
          updateData,
        );

        const status_suspended = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.SUSPENDED,
        });
        const status_inactive = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.UNNACTIVE,
        });

        let final_status: PointStatusEntity;

        if (Incident.point?.facilitator_employee) {
          final_status = status_suspended;
        } else {
          final_status = status_inactive;
        }

        const pointStatusChanged = await this.PointRepository.update(
          Incident.point.id,
          {
            status: final_status,
          },
        );

        return updated;
      }

      if (type !== TICKET_TYPE.DISCONNECTION && type !== TICKET_TYPE.REGULAR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El tipo de ticket debe ser regular o disconnection',
        });
      }

      return null;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async closeIncident(id: string, type: TICKET_TYPE) {
    try {
      if (type === TICKET_TYPE.REGULAR) {
        const Incident = await this.IncidentRepository.findOneBy({ id });

        if (!Incident) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se pudo encontrar la incidente',
          });
        }

        const updateData: Partial<IncidentEntity> = {
          closed_date: new Date(),
        };
        //notificar cierre del incidente
        //await this.EmailService.sendIncidentEmail(Incident);
        return await this.IncidentRepository.update(id, updateData);
      }

      if (type === TICKET_TYPE.DISCONNECTION) {
        const Incident = await this.DisconnectionIncidentRepository.findOneBy({
          id,
        });

        if (!Incident) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se pudo encontrar la incidente',
          });
        }

        const updateData: Partial<DisconnectionIncidentEntity> = {
          closed_date: new Date(),
        };

        return await this.DisconnectionIncidentRepository.update(
          id,
          updateData,
        );
      }

      if (type !== TICKET_TYPE.DISCONNECTION && type !== TICKET_TYPE.REGULAR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El tipo de ticket debe ser regular o disconnection',
        });
      }

      return null;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async reassignDisconnectionIncident(id: string, employee_id: string) {
    try {
      const Incident = await this.DisconnectionIncidentRepository.findOneBy({
        id,
      });

      if (!Incident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el incidente',
        });
      }

      const employee = await this.EmployeeRepository.findOneBy({
        id: employee_id,
      });

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el empleado',
        });
      }

      return await this.DisconnectionIncidentRepository.update(Incident.id, {
        assigned_to: employee,
      });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findIncident(
    page: number,
    limit: number,
    user_id: string,
    req: Request,
  ): Promise<IncidentResultDTO> {
    try {
      let selectParams: any[] = [];

      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .andWhere('user.id = :id', { id: user_id })
        .getOne();

      const queryBuilder = this.IncidentRepository.createQueryBuilder(
        'incident',
      ).leftJoinAndSelect('incident.issue', 'issue');

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
          key !== 'incidentType' &&
          key !== 'employeeType' &&
          key !== 'createdAt' &&
          key !== 'solved_date' &&
          key !== 'closed_date'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `incident.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} incident.observation ILIKE '%${
            req.query.search
          }%' OR  incident.cnt_ticket ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        selectParams.push(query_string);
      }

      if (req.query?.createdAt) {
        const date = new Date(String(req.query?.createdAt));

        selectParams.push({
          createdAt: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query?.solved_date) {
        const date = new Date(String(req.query?.solved_date));

        selectParams.push({
          solved_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req.query?.closed_date) {
        const date = new Date(String(req.query?.closed_date));

        selectParams.push({
          closed_date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      selectParams.forEach((param) => {
        queryBuilder.andWhere(param);
      });

      if (
        employee?.user_type === ROLES.TECHNICAL_ASSISTENT ||
        employee?.user_type === ROLES.MANAGER ||
        employee?.user_type === ROLES.FACILITATOR
      ) {
        queryBuilder.andWhere('assigned_to.id = :id OR requester.id = :id', {
          id: employee.id,
        });
      }

      selectParams.forEach((param) => {
        queryBuilder.andWhere(param);
      });

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Incident, totalElements] = await queryBuilder

        .leftJoinAndSelect('incident.point', 'point')
        .leftJoinAndSelect('incident.requester', 'requester')
        .leftJoinAndSelect('incident.assigned_to', 'assigned_to')

        .leftJoinAndSelect('incident.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .orderBy('incident.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Incident],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async reassignIncident(id: string, employee_id: string) {
    try {
      const Incident = await this.IncidentRepository.findOneBy({ id });

      if (!Incident) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el incidente',
        });
      }

      const employee = await this.EmployeeRepository.findOneBy({
        id: employee_id,
      });

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se ha encontrado el empleado',
        });
      }

      return await this.IncidentRepository.update(Incident.id, {
        assigned_to: employee,
      });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof IncidentDTO;
    value: any;
  }): Promise<GetIncidentResultDTO> {
    try {
      const Incident = await this.IncidentRepository.createQueryBuilder(
        'incident',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('incident.issue', 'issue')
        .leftJoinAndSelect('incident.point', 'point')
        .leftJoinAndSelect('incident.requester', 'requester')
        .leftJoinAndSelect('incident.assigned_to', 'assigned_to')
        .getOne();

      const IncidentLogs = await this.IncidentLogsRepository.createQueryBuilder(
        'incident_log',
      )
        .leftJoin('incident_log.incident', 'incident')
        .where('incident.id = :id', { id: Incident.id })
        .getMany();

      const IncidentAssets =
        await this.IncidentAssetsRepository.createQueryBuilder('incident_asset')
          .leftJoin('incident_asset.incident', 'incident')
          .where('incident.id = :id', { id: Incident.id })
          .leftJoinAndSelect('incident_asset.asset', 'asset')
          .leftJoinAndSelect('asset.type', 'type')
          .leftJoinAndSelect('asset.responsible_employee', 'assigned_employee')
          .getMany();

      const files = await this.fileServices.findByEntityId(
        Incident.id,
        FILE_ENTITY_NAMES.INCIDENT,
      );

      Incident.files = files;

      return { ...Incident, logs: IncidentLogs, assets: IncidentAssets };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findIncidentById(id: string) {
    try {
      const Incident: IncidentEntity =
        await this.IncidentRepository.createQueryBuilder('incident')
          .leftJoinAndSelect('incident.issue', 'issue')
          .leftJoinAndSelect('incident.point', 'point')
          .leftJoinAndSelect('incident.requester', 'requester')
          .leftJoinAndSelect('incident.assigned_to', 'assigned_to')
          .where({ id })
          .getOne();
      const IncidentLogs = await this.IncidentLogsRepository.createQueryBuilder(
        'incident_log',
      )
        .leftJoin('incident_log.incident', 'incident')
        .where('incident.id = :id', { id: Incident?.id })
        .getMany();

      const IncidentAssets =
        await this.IncidentAssetsRepository.createQueryBuilder('incident_asset')
          .leftJoin('incident_asset.incident', 'incident')
          .where('incident.id = :id', { id: Incident?.id })
          .leftJoinAndSelect('incident_asset.asset', 'asset')
          .leftJoinAndSelect('asset.type', 'type')
          .leftJoinAndSelect('asset.details', 'details')
          .leftJoinAndSelect('asset.responsible_employee', 'assigned_employee')
          .getMany();

      const Assets = IncidentAssets.map((obj) => obj.asset);

      if (Incident) {
        const files = await this.fileServices.findByEntityId(
          Incident?.id,
          FILE_ENTITY_NAMES.INCIDENT,
        );

        Incident.files = files;
      }

      return { ...Incident, logs: IncidentLogs, assets: Assets };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findDisconnectionIncidentById(id: string) {
    try {
      const Incident: DisconnectionIncidentEntity =
        await this.DisconnectionIncidentRepository.createQueryBuilder(
          'disconnection_incident',
        )
          .leftJoinAndSelect('disconnection_incident.requester', 'requester')
          .leftJoinAndSelect(
            'disconnection_incident.assigned_to',
            'assigned_to',
          )
          .leftJoinAndSelect('disconnection_incident.point', 'point')
          .where('disconnection_incident.id = :id', { id })
          .getOne();
      const IncidentLogs = await this.IncidentLogsRepository.createQueryBuilder(
        'incident_log',
      )
        .leftJoin(
          'incident_log.disconnection_incident',
          'disconnection_incident',
        )
        .where('disconnection_incident.id = :id', { id: Incident?.id })
        .getMany();

      const files = await this.fileServices.findByEntityId(
        Incident?.id,
        FILE_ENTITY_NAMES.DISCONNECTION_INCIDENT,
      );

      Incident.files = files;

      return { ...Incident, logs: IncidentLogs };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateIncident(
    id: string,
    body: IncidentUpdateDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const IncidentToUpdate = await this.IncidentRepository.findOneBy({
        id,
      });

      if (!IncidentToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la incidente',
        });
      }
      const updateData: Partial<IncidentEntity> = {
        cnt_ticket: body.cnt_ticket,
        observation: body.observation,
      };

      if (body.assets) {
        const i_asset = await this.IncidentAssetsRepository.find({
          where: {
            incident: { id: IncidentToUpdate.id },
          },
          relations: { incident: true },
        });

        const ids = i_asset.map((asset) => asset.id);

        if (ids?.length > 0) {
          await this.IncidentAssetsRepository.delete(ids);
        }

        body.assets.forEach(async (asset) => {
          const _asset = await this.AssetService.findOne(asset.id);

          if (!_asset) {
            return null;
          }

          const asset_exists = await this.IncidentAssetsRepository.findOne({
            where: {
              asset: { id: asset.id },
              incident: { id: IncidentToUpdate.id },
            },
            relations: { asset: true, incident: true },
          });

          if (asset_exists) {
            return null;
          }

          const objAsset = new IncidentAssetsEntity();
          objAsset.asset = _asset;
          objAsset.incident = IncidentToUpdate;

          await this.IncidentAssetsRepository.save(objAsset);
        });
      }

      const objUpdated = await this.IncidentRepository.update(id, updateData);

      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.INCIDENT,
          relationshipName: 'incident',
          valueRelationship: IncidentToUpdate.id,
        };
        await this.fileServices.deleteAndCreateFile(files, optionsFiles);
      }
      
      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'incident',
        entry_id: IncidentToUpdate.id,
        ip,
      });
      //previo a notificar toca obtener todos los objetos relacionados
      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',) .leftJoin('employee.user', 'user').where('user.id = :id', { id: user_id })
        .getOne();
      IncidentToUpdate.requester = employee;
      
      const issue = await this.IncidentIssuesService.findIncidentIssuesById(
        body.issue.id,
      );
      IncidentToUpdate.issue=issue;

      const point = await this.PointRepository.createQueryBuilder('point')
        .leftJoin('point.facilitator_employee', 'facilitator_employee')
        .leftJoinAndSelect( 'point.technical_asistent_employee',
                            'technical_asistent_employee',)
        .where('facilitator_employee.id = :id', { id: employee.id })
        .getOne();
      IncidentToUpdate.point = point;

      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.TECHNICALASSISTAN) {
        const tech_assistent = point.technical_asistent_employee;
        IncidentToUpdate.assigned_to = tech_assistent;
      }

      if (issue.employeeType === INCIDENT_EMPLOYEE_TYPE.MANAGER) {
        const commandChain =
          await this.CommandChainRepository.createQueryBuilder('employee_command_chain',)
            .leftJoinAndSelect('employee_command_chain.boss', 'boss')
            .leftJoin('employee_command_chain.subordinate', 'subordinate')
            .where('subordinate.id = :id', { id: employee.id })
            .getOne();
          IncidentToUpdate.assigned_to = commandChain.boss;
      }
      //obtengo el jefe del asignado a
      const jefeAsignado =
          await this.CommandChainRepository.createQueryBuilder('employee_command_chain',)
            .leftJoinAndSelect('employee_command_chain.boss', 'boss')
            .leftJoin('employee_command_chain.subordinate', 'subordinate')
            .where('subordinate.id = :id', { id: IncidentToUpdate.assigned_to.id })
            .getOne();                
      //notificar actualización del incidente          
      await this.EmailService.sendIncidentEmail(IncidentToUpdate, jefeAsignado?.boss?.email);
      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateDisconnectionIncident(
    id: string,
    body: DisconnectionIncidentUpdateDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const IncidentToUpdate =
        await this.DisconnectionIncidentRepository.findOneBy({
          id,
        });

      if (!IncidentToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la incidente',
        });
      }
      const updateData: Partial<DisconnectionIncidentEntity> = {
        observation: body.observation,
      };

      if (body.point) {
        const point = await this.PointRepository.createQueryBuilder('point')
          .leftJoinAndSelect(
            'point.technical_asistent_employee',
            'technical_asistent_employee',
          )
          .where('point.id = :id', { id: body?.point })
          .getOne();

        const tech_assistent = await this.EmployeeRepository.createQueryBuilder(
          'employee',
        )
          .leftJoin('employee.user', 'user')
          .where('employee.id = :id', {
            id: point?.technical_asistent_employee?.id,
          })
          .getOne();

        updateData.assigned_to = tech_assistent;
        updateData.point = point;
      }

      const objUpdated = await this.DisconnectionIncidentRepository.update(
        IncidentToUpdate?.id,
        updateData,
      );

      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.INCIDENT,
          relationshipName: 'incident',
          valueRelationship: IncidentToUpdate.id,
        };
        await this.fileServices.deleteAndCreateFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'disconnection_incident',
        entry_id: IncidentToUpdate.id,
        ip,
      });

      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteIncident(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Incident: DeleteResult = await this.IncidentRepository.softDelete(
        id,
      );
      if (Incident.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'incident',
        entry_id: id,
        ip,
      });
      return Incident;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteDisconnectionIncident(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Incident: DeleteResult =
        await this.DisconnectionIncidentRepository.softDelete(id);
      if (Incident.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'disconnection_incident',
        entry_id: id,
        ip,
      });
      return Incident;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteIncidentLog(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const IncidentLog: DeleteResult =
        await this.IncidentLogsRepository.softDelete(id);
      if (IncidentLog.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return IncidentLog;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteIncidentAsset(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const IncidentAsset: DeleteResult =
        await this.IncidentAssetsRepository.softDelete(id);
      if (IncidentAsset.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return IncidentAsset;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getIncidentsByDateRangeAndPoint(
    startDate?: string,
    endDate?: string,
    point?: string,
  ): Promise<{ data: IncidentReportDTO[]; count: any }> {
    const conditions: any = {};

    if (startDate && !endDate) {
      const currentDate = new Date();
      endDate = currentDate.toISOString().split('T')[0];
    }

    if (endDate && !startDate) {
      const currentYearFirstDay = new Date(new Date().getFullYear(), 0, 1);
      startDate = currentYearFirstDay.toISOString().split('T')[0];
    }

    if (startDate && endDate) {
      conditions.createdAt = Between(
        startOfDay(new Date(startDate)),
        endOfDay(new Date(endDate)),
      );
    }

    if (point) {
      const objPoint: PointEntity = await this.pointService.findPointByIdTemp(
        point,
      );
      conditions.point = { id: objPoint ? objPoint.id : null };
    }

    const objIncidents = await this.IncidentRepository.find({
      where: conditions,
      relations: [
        'issue',
        'requester',
        'assigned_to',
        'logs',
        'logs.made_by',
        'point',
        'point.address',
        'point.address.parish',
        'point.address.parish.canton',
        'point.address.parish.canton.province',
      ],
    });

    const objDisconnectionIncidents =
      await this.DisconnectionIncidentRepository.find({
        where: conditions,
        relations: [
          'requester',
          'assigned_to',
          'logs',
          'logs.made_by',
          'point',
          'point.address',
          'point.address.parish',
          'point.address.parish.canton',
          'point.address.parish.canton.province',
        ],
      });

    // Primero, obtenemos el incidente específico que estamos buscando
    const incident = await this.IncidentRepository.findOne({
      where: conditions,
      relations: ['point'],
    });

    // if (!incident) {
    //   // Aquí puedes manejar el caso de que no se haya encontrado el incidente que cumple con las condiciones.
    //   // Puedes lanzar una excepción o devolver un mensaje de error, según tus necesidades.
    //   throw new Error('Incidente no encontrado.');
    // }

    // // Ahora que tenemos el incidente, verificamos que tenga la relación 'point' y que esta no sea nula
    // if (!incident.point) {
    //   // Manejo del caso en el que el incidente no tenga un punto asociado.
    //   // Puedes lanzar una excepción o devolver un mensaje de error.
    //   throw new Error('El incidente no tiene un punto asociado.');
    // }

    // Ahora accedemos a la relación 'address' desde el punto
    const pointWithAddress = await this.PointRepository.findOne({
      where: { id: incident?.point?.id },
      relations: ['address'],
    });

    if (!pointWithAddress || !pointWithAddress?.address) {
      // Manejo del caso en el que el punto no tenga una dirección asociada.
      // Puedes lanzar una excepción o devolver un mensaje de error.
      throw new Error('El punto no tiene una dirección asociada.');
    }

    // Continuamos accediendo a las relaciones 'parish', 'canton' y 'province'
    const address = pointWithAddress.address;
    const parishWithCanton = await this.addressRepository.findOne({
      where: { id: address?.id },
      relations: ['parish'],
    });

    if (!parishWithCanton || !parishWithCanton?.parish) {
      // Manejo del caso en el que la dirección no tenga una parroquia asociada.
      // Puedes lanzar una excepción o devolver un mensaje de error.
      throw new Error('La dirección no tiene una parroquia asociada.');
    }

    const parish = parishWithCanton.parish;
    const cantonWithProvince = await this.parishRepository.findOne({
      where: { id: parish?.id },
      relations: ['canton'],
    });

    if (!cantonWithProvince || !cantonWithProvince?.canton) {
      // Manejo del caso en el que la parroquia no tenga un cantón asociado.
      // Puedes lanzar una excepción o devolver un mensaje de error.
      throw new Error('La parroquia no tiene un cantón asociado.');
    }

    const canton = cantonWithProvince?.canton;
    const province = await this.cantonRepository.findOne({
      where: { id: canton?.id },
      relations: ['province'],
    });

    if (!province || !province?.province) {
      // Manejo del caso en el que el cantón no tenga una provincia asociada.
      // Puedes lanzar una excepción o devolver un mensaje de error.
      throw new Error('El cantón no tiene una provincia asociada.');
    }

    // Finalmente, tenemos el nombre de la provincia
    const provinceName = province?.province?.name;

    console.log(provinceName); // Aquí tienes el nombre de la provincia.

    if (objIncidents?.length > 0 || objDisconnectionIncidents.length > 0) {
      const listIncident: IncidentReportDTO[] = objIncidents?.map(
        (incident) => {
          const { point, solved_date, closed_date, createdAt } = incident;

          let status = '';
          let logs: IncidentLogsEntity[] = [];

          if (closed_date && solved_date) {
            status = 'SOLUCIONADO';
          } else if (!closed_date && solved_date) {
            status = 'GESTIONADO';
          } else {
            status = 'EN PROCESO';
          }

          const objResult: IncidentReportDTO = {
            province: provinceName,
            point: point ? point : null,
            incident_code: incident.incident_code,
            incident_number: incident.incident_number.toString(),
            cnt_ticket: incident.cnt_ticket,
            details: incident.observation,
            issue: incident.issue,
            logs: incident.logs,
            responsible: incident.assigned_to,
            requester: incident.requester,
            status,
            register_date: createdAt.toString(),
            solved_date,
            closed_date,
          };

          return objResult;
        },
      );

      const listDisconnectionIncident: IncidentReportDTO[] =
        objDisconnectionIncidents?.map((incident) => {
          const { point, solved_date, closed_date, createdAt } = incident;

          let status = '';
          let logs: IncidentLogsEntity[] = [];

          if (closed_date && solved_date) {
            status = 'SOLUCIONADO';
          } else if (!closed_date && solved_date) {
            status = 'GESTIONADO';
          } else {
            status = 'EN PROCESO';
          }

          const objResult: IncidentReportDTO = {
            province: provinceName,
            point: point ? point : null,
            incident_code: `${incident.incident_number.toString()}`,
            incident_number: incident.incident_number.toString(),
            cnt_ticket: incident.cnt_ticket,
            details: incident.observation,
            issue: {
              name: 'Desconexión',
              incidentType: TYPE_OF_INCIDENT.CNTSERVICES,
              employeeType: INCIDENT_EMPLOYEE_TYPE.TECHNICALASSISTAN,
            },
            logs: incident.logs,
            responsible: incident.assigned_to,
            requester: incident.requester,
            status,
            register_date: createdAt.toString(),
            solved_date,
            closed_date,
          };

          return objResult;
        });

      const disconenctionCount = {
        type: 'Desconexión',
        count: objDisconnectionIncidents.length,
      };
      let count = this.countIncidentPerType(objIncidents);

      count.push(disconenctionCount);

      let _listIncidents = [...listIncident, ...listDisconnectionIncident];

      _listIncidents.sort((a, b) => {
        return (
          new Date(a.register_date).getTime() -
          new Date(b.register_date).getTime()
        );
      });

      return { data: _listIncidents, count };
    } else {
      return { data: [], count: [] };
    }
  }

  public async getAssignedIncidentsPerPoint(user_id: string, point_id: string) {
    try {
      const employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .leftJoin('employee.user', 'user')
        .where('user.id = :id', { id: user_id })
        .getOne();

      const queryBuilder = this.IncidentRepository.createQueryBuilder(
        'incident',
      )
        .leftJoinAndSelect('incident.issue', 'issue')
        .leftJoinAndSelect('incident.point', 'point')
        .leftJoinAndSelect('incident.assigned_to', 'assigned_to')
        .leftJoinAndSelect('incident.requester', 'requester');

      if (employee?.user_type === ROLES.FACILITATOR) {
        queryBuilder.where('requester.id = :requested_id', {
          requested_id: employee.id,
        });
      }

      if (
        employee?.user_type === ROLES.TECHNICAL_ASSISTENT ||
        employee?.user_type === ROLES.MANAGER
      ) {
        queryBuilder.where('assigned_to.id = :assigned_id', {
          assigned_id: employee.id,
        });
      }

      if (point_id) {
        const point = await this.PointRepository.findOne({
          where: { id: point_id },
        });

        queryBuilder.andWhere('point.id = :point_id', { point_id: point.id });
      }

      const incidents = await queryBuilder.getMany();

      return { data: [...incidents] };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findIncidentsByIds(ids: string[]): Promise<IncidentEntity[]> {
    try {
      return await this.IncidentRepository.findBy({ id: In(ids) });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public countIncidentPerType(incidents: IncidentEntity[]) {
    try {
      let types = [];

      incidents.forEach((incident) => {
        if (
          !types.find((type) => {
            return type === incident.issue.name;
          })
        ) {
          types.push(incident.issue.name);
        }
      });

      let count = [];

      types.forEach((type) => {
        let countObj = {
          type,
          count: 0,
        };

        incidents.forEach((incident) => {
          if (incident.issue.name === type) {
            countObj.count++;
          }
        });

        count.push(countObj);
      });

      return count;
    } catch (error) {
      console.log(error);
    }
  }
}

