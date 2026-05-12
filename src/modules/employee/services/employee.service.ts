import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from '../entities/employee.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  AssignEmployeeRoleDTO,
  AssignEmployeeSubordinateDTO,
  EmployeeDTO,
  EmployeeResultDTO,
  EmployeeUpdateDTO,
  UpdateCommandChainDTO,
} from '../dto/employee.dto';
import { ErrorManager } from 'src/utils';
import { EmployeePeriodsEntity } from '../entities/employee_periods.entity';
import {
  AddFileToPeriodDTO,
  EmployeePeriodDTO,
  EmployeePeriodUpdateDTO,
} from '../dto/employee-period.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { UserDTO, UserUpdateDTO } from 'src/modules/users/dto/user.dto';
import { userInfo } from 'os';
import { RolesService } from 'src/modules/roles/services/roles.service';
import { ROLES, ROLE_VALUES } from 'src/constants';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import {
  COMMAND_TYPE,
  EMPLOYEE_STATUS,
  FILE_ENTITY_NAMES,
  MODULES_NAMES,
  POINT_STATUS,
  VULNERABILITY_STATUS,
} from 'src/constants/enums';
import { EmployeeCommandChainEntity } from '../entities/employee_command_chain.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { PointStatusService } from 'src/modules/nomencladores/point-status/services/point-status.service';
import { ProfessionalTitleService } from 'src/modules/nomencladores/professional-title/services/professional-title.service';
import { SpecializationService } from 'src/modules/nomencladores/specializations/services/specializations.service';
import { EducationLevelService } from 'src/modules/nomencladores/education-level/services/education-level.service';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SecurityDTO } from 'src/modules/security/dto/security.dto';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { Request } from 'express';
import { PointStatusEntity } from 'src/modules/nomencladores/point-status/entities/point-status.entity';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';
import { DisconnectionIncidentEntity } from 'src/modules/incident/entities/disconnection-incident.entity';
import { RessignEmailDTO } from 'src/modules/email/dto/email.dto';
import { EmailService } from 'src/modules/email/services/email.service';
import { format } from 'date-fns';
import { getRessignMailTemplate } from 'src/utils/ressign-mail.template';
import { PermissionRequestEntity } from 'src/modules/permissionRequest/entities/permission-request.entity';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';
import { AssetDetailsEntity } from 'src/modules/asset/entities/asset-details.entity';
import { EmployeeVulnerabilityPeriodEntity } from '../entities/employee_vulnerability_period.entity';
import { EmployeeTransferEntity } from '../entities/employee_transfer.entity';
import { v4 } from 'uuid';
import {
  Config,
  generateFromEmail,
  generateUsername,
  uniqueUsernameGenerator,
} from 'unique-username-generator';
import { UserRolesEntity } from 'src/modules/users/entities/users-roles.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly EmployeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(EmployeePeriodsEntity)
    private readonly PeriodsRepository: Repository<EmployeePeriodsEntity>,
    @InjectRepository(EmployeeCommandChainEntity)
    private readonly CommandChainRepository: Repository<EmployeeCommandChainEntity>,
    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,
    @InjectRepository(DisconnectionIncidentEntity)
    private readonly DisconnectionIncidentRepository: Repository<DisconnectionIncidentEntity>,
    @InjectRepository(IncidentEntity)
    private readonly IncidentRepository: Repository<IncidentEntity>,
    @InjectRepository(EmployeeVulnerabilityPeriodEntity)
    private readonly EmployeeVulnerabilityPeriods: Repository<EmployeeVulnerabilityPeriodEntity>,

    @InjectRepository(PermissionRequestEntity)
    private readonly PermissionRequestRepository: Repository<PermissionRequestEntity>,
    @InjectRepository(AssetEntity)
    private readonly AssetRepository: Repository<AssetEntity>,

    @InjectRepository(EmployeeTransferEntity)
    private readonly EmployeeTransferRepository: Repository<EmployeeTransferEntity>,

    @InjectRepository(UserRolesEntity)
    private readonly UserRolesRepository: Repository<UserRolesEntity>,

    private readonly FileService: FileService,
    private readonly UserService: UsersService,
    private readonly RolesService: RolesService,
    private readonly PointStatusService: PointStatusService,
    private readonly ProfessionalTitleService: ProfessionalTitleService,
    private readonly SpecializationService: SpecializationService,
    private readonly EducationLevelService: EducationLevelService,
    private readonly SecurityService: SecurityService,
  ) {}

  public async createEmployee(
    body: EmployeeDTO,
    user_id?: string,
    ip?: string,
  ): Promise<EmployeeEntity> {
    try {
      console.log(body);
      let username = await this.getUsername(body.name);
      const userdata: UserDTO = {
        email: body.email,
        username: username,
        password: username,
        isFirstTime: true,
      };
      const unassigned_role = await this.RolesService.findBy({
        key: 'role_value',
        value: ROLES.UNASSIGNED,
      });
      userdata.role = unassigned_role;
      const user = await this.UserService.createUser({ ...userdata }).catch(
        (err) => {
          throw new ErrorManager({
            type: 'INTERNAL_SERVER_ERROR',
            message: 'Error al crear el usuario para el nuevo empleado',
          });
        },
      );

      const objEmployee = new EmployeeEntity();
      objEmployee.name = body.name;
      objEmployee.id_value = body.id_value;
      objEmployee.position = body.position;
      objEmployee.code = body.code;
      objEmployee.address = body.address;
      objEmployee.email = body.email;
      objEmployee.phone = body.phone;
      objEmployee.facebook_profile = body.facebook_profile;
      objEmployee.salary = body.salary;
      objEmployee.gender = body.gender;
      objEmployee.marital_status = body.marital_status;

      if (body?.professional_title?.id) {
        const professional_title =
          await this.ProfessionalTitleService.findProfessionalTitleById(
            body?.professional_title?.id,
          );
        objEmployee.professional_title = professional_title;
      }

      if (body.education_level?.id) {
        const education_level =
          await this.EducationLevelService.findEducationLevelById(
            body?.education_level?.id,
          );
        objEmployee.education_level = education_level;
      }

      if (body?.specialization?.id) {
        const specialization =
          await this.SpecializationService.findSpecializationById(
            body?.specialization?.id,
          );
        objEmployee.specialization = specialization;
      }

      objEmployee.user = user;
      objEmployee.sign_authorization = body.sign_authorization;

      const saved_employee = await this.EmployeeRepository.save(
        objEmployee,
      ).catch(async (err) => {
        await this.UserService.deleteUser(user.id);
        console.log(err);
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear el empleado',
        });
      });

      await body.periods?.forEach(async (period) => {
        const objPeriod = new EmployeePeriodsEntity();
        objPeriod.start_date = period.start_date;
        objPeriod.end_date = period.end_date;
        objPeriod.employee = saved_employee;
        return await this.PeriodsRepository.save(objPeriod);
      });

      console.log(body);
      await body.vulnerability_periods?.forEach(async (period) => {
        console.log(period);
        const objPeriod = new EmployeeVulnerabilityPeriodEntity();
        objPeriod.start_date = period.start_date
          ? new Date(period.start_date)
          : null;
        objPeriod.end_date = period.end_date ? new Date(period.end_date) : null;
        objPeriod.status = period.status;

        if (period.status === VULNERABILITY_STATUS.DISABLED) {
          objPeriod.isDisabled = true;
        } else {
          objPeriod.isDisabled = false;
        }

        if (!objPeriod.end_date) {
          await this.EmployeeRepository.update(saved_employee.id, {
            status: EMPLOYEE_STATUS.VULNERABLE,
          });
        }

        if (objPeriod.end_date > new Date()) {
          await this.EmployeeRepository.update(saved_employee.id, {
            status: EMPLOYEE_STATUS.VULNERABLE,
          });
        }

        objPeriod.employee = saved_employee;
        return await this.EmployeeVulnerabilityPeriods.save(objPeriod);
      });

      const security: SecurityDTO = {
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        entity: 'employee',
        entry_id: saved_employee.id,
        user_id: user_id,
        ip,
      };

      await this.SecurityService.createSecurity(security);

      return saved_employee;
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async validateUniqueValues(email: string, id_value: string) {
    try {
      let invalid_fields: { property: string; message: string }[] = [];

      if (email) {
        const user = await this.UserService.findBy({
          key: 'email',
          value: email,
        });

        if (user)
          invalid_fields.push({
            property: 'email',
            message: 'El correo proporcionado ya esta en uso',
          });
      }

      if (id_value) {
        const employee = await this.EmployeeRepository.findOne({
          where: {
            id_value: id_value,
          },
          withDeleted: true,
        });

        if (employee) {
          invalid_fields.push({
            property: 'id_value',
            message: 'La identificación proporcionada ya esta en uso',
          });
        }
      }

      if (invalid_fields?.length > 0) {
        console.log(invalid_fields);
        let field_string = '';

        invalid_fields.forEach(
          (field, i) =>
            (field_string =
              field_string +
              `${i === 0 ? '' : '/'}${field.property}#${field.message}`),
        );

        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `Algunos campos ya se encuentran en uso :: ${field_string}`,
        });
      }
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEmployee(
    page: number,
    limit: number,

    req: Request,
  ): Promise<EmployeeResultDTO> {
    try {
      const queryBuilder =
        this.EmployeeRepository.createQueryBuilder('employee');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `employee.${key}`
            }='${values[i]}'`,
          );

          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} employee.name ILIKE '%${
            req.query.search
          }%' OR  employee.code ILIKE '%${
            req.query.search
          }%' OR  employee.address ILIKE '%${
            req.query.search
          }%' OR  employee.id_value ILIKE '%${
            req.query.search
          }%' OR  employee.facebook_profile ILIKE '%${req.query.search}%'`,
        );
      }

      //console.log(query_string);

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Employee, totalElements] = await queryBuilder
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('employee.periods', 'periods')
        .leftJoinAndSelect('employee.professional_title', 'professional_title')
        .leftJoinAndSelect('employee.education_level', 'education_level')
        .leftJoinAndSelect('employee.specialization', 'specialization')
        .leftJoinAndSelect('employee.point', 'point')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'userRole')
        .leftJoinAndSelect(
          'employee.vulnerability_periods',
          'vulnerability_periods',
        )
        .andWhere('employee.deletedAt IS NULL')
        //.orderBy('employee.updatedAt', 'DESC')
        .orderBy('employee.name', 'ASC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      for (let i = 0; i < Employee.length; i++) {
        let vulnerable = false;
        if (Employee[i]?.status === EMPLOYEE_STATUS.VULNERABLE) {
          Employee[i]?.vulnerability_periods?.forEach((period) => {
            if (period?.end_date && period?.end_date > new Date()) {
              vulnerable = true;
            }
            if (period?.start_date && !period?.end_date) {
              vulnerable = true;
            }
          });

          if (!vulnerable) {
            await this.EmployeeRepository.update(Employee[i].id, {
              status: EMPLOYEE_STATUS.ACTIVE,
            });
          }
        }
      }

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Employee],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getFacilitatorDataReport(id: string) {
    try {
      const employee = await this.EmployeeRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      if (employee.user_type !== ROLES.FACILITATOR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado no es facilitador',
        });
      }

      const permissions = await this.PermissionRequestRepository.find({
        where: { user: { id: employee.user.id } },
        relations: { user: true, permissionType: true },
      });

      const incidents = await this.IncidentRepository.find({
        where: { requester: { id: employee.id } },
        relations: { requester: true, issue: true },
      });

      const assets = await this.AssetRepository.find({
        where: { responsible_employee: { id: employee.id } },
        relations: { responsible_employee: true, type: true, details: true },
      });

      return { employee, permissions, incidents, assets };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async reassignCommandChain(
    old_id: string,
    new_id: string,
    type: COMMAND_TYPE,
  ) {
    try {
      const old_employee = await this.findEmployeeById(old_id);

      const new_employee = await this.findEmployeeById(new_id);

      if (old_employee.user_type !== new_employee.user_type) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message:
            'El empleado a asignar debe tener el mismo rol que el empleado anterior',
        });
      }

      const commandChain = this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .where(`${type}.id = :id`, { id: old_employee.id });

      if (type === COMMAND_TYPE.BOSS) {
        return await commandChain.update({ boss: new_employee }).execute();
      }

      if (type === COMMAND_TYPE.SUBORDINATE) {
        return await commandChain
          .update({ subordinate: new_employee })
          .execute();
      }
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCommandChain(id: string, body: UpdateCommandChainDTO) {
    try {
      const chain = await this.CommandChainRepository.findOne({
        where: { id },
      });

      if (!chain) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No existe esa cadena de mando',
        });
      }

      let updatedData: Partial<EmployeeCommandChainEntity>;

      if (body.boss_id) {
        const employee = await this.findEmployeeById(body.boss_id);

        updatedData.boss = employee;
      }

      if (body.subordinate_id) {
        const employee = await this.findEmployeeById(body.subordinate_id);

        updatedData.subordinate = employee;
      }

      return await this.CommandChainRepository.update(chain.id, updatedData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async MarkEmployeeAsUnbound(id: string) {
    try {
      const employee = await this.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      const periods = await this.PeriodsRepository.find({
        where: {
          employee: {
            id: employee?.id,
          },
        },
        relations: {
          employee: true,
        },
      });

      const ids = periods?.map((period) => {
        if (!period?.end_date) {
          return period?.id;
        }
      });

      await this.PeriodsRepository.update(ids, {
        end_date: new Date().toISOString(),
      });

      const updatedEmployee = await this.EmployeeRepository.update(
        employee?.id,
        {
          status: EMPLOYEE_STATUS.UNNACTIVE,
        },
      );

      if (employee.user_type === ROLES.FACILITATOR) {
        const point = await this.PointRepository.createQueryBuilder('point')
          .leftJoin('point.facilitator_employee', 'facilitator_employee')
          .where('facilitator_employee.id = :id', { id: employee?.id })
          .getOne();

        const status_suspended = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.SUSPENDED,
        });
        const status_inactive = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.UNNACTIVE,
        });

        let final_status: PointStatusEntity;

        const Incident = await this.DisconnectionIncidentRepository.findOne({
          where: { point: { id: point?.id } },
          relations: { point: true },
        });

        if (!Incident) {
          final_status = status_suspended;
        } else {
          final_status = status_inactive;
        }

        if (point) {
          const pointStatusChanged = await this.PointRepository.update(
            point?.id,
            {
              status: final_status,
            },
          );
        }

        const Incidents = await this.IncidentRepository.find({
          where: { requester: { id: employee?.id } },
          relations: { requester: true },
        });

        const DisconnectionIncidents =
          await this.DisconnectionIncidentRepository.find({
            where: { requester: { id: employee?.id } },
            relations: { requester: true },
          });

        const boss = await this.getBoss(employee.id);

        Incidents.forEach(async (incident) => {
          if (!incident.closed_date) {
            await this.IncidentRepository.update(incident.id, {
              requester: boss,
            });
          }
        });

        DisconnectionIncidents.forEach(async (incident) => {
          if (!incident.closed_date) {
            await this.DisconnectionIncidentRepository.update(incident.id, {
              requester: boss,
            });
          }
        });

        return updatedEmployee;
      }
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async sendRessignLetter(user_id: string) {
    try {
      const payload = new RessignEmailDTO();
      const ressign_employee = await this.findEmployeeByUserId(user_id);

      if (
        ressign_employee.user_type === ROLES.FACILITATOR ||
        ressign_employee.user_type === ROLES.TECHNICAL_ASSISTENT
      ) {
        const point = await this.PointRepository.createQueryBuilder('point')
          .leftJoinAndSelect(
            'point.facilitator_employee',
            'facilitator_employee',
          )
          .leftJoinAndSelect(
            'point.technical_asistent_employee',
            'technical_asistent_employee',
          )
          .leftJoinAndSelect('point.address', 'address')
          .leftJoinAndSelect('address.parish', 'parish')
          .leftJoinAndSelect('parish.canton', 'canton')
          .leftJoinAndSelect('canton.province', 'province')
          .where(
            'facilitator_employee.id = :id OR technical_asistent_employee.id = :id',
            { id: ressign_employee.id },
          )
          .getOne();

        if (point) {
          payload.point = point.name;
          payload.canton = point.address.parish.canton.name;
          payload.parish = point.address.parish.name;
          payload.province = point.address.parish.canton.province.name;
        }
      }

      payload.email = ressign_employee.email;
      payload.nui = ressign_employee.id_value;
      payload.name = ressign_employee.name;
      payload.phone = ressign_employee.phone;
      payload.date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      const role = ROLE_VALUES.find(
        (rol) => rol.role_value === ressign_employee.user_type,
      );

      payload.role = role.role_name;

      return payload;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof EmployeeDTO; value: any }) {
    try {
      const Employee = await this.EmployeeRepository.createQueryBuilder(
        'employee',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('employee.periods', 'periods')
        .leftJoinAndSelect(
          'employee.vulnerability_periods',
          'vulnerability_periods',
        )
        .leftJoinAndSelect('employee.professional_title', 'professional_title')
        .leftJoinAndSelect('employee.education_level', 'education_level')
        .leftJoinAndSelect('employee.specialization', 'specialization')
        .getOne();

      return Employee;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEmployeeById(id: string) {
    try {
      const Employee: EmployeeEntity =
        await this.EmployeeRepository.createQueryBuilder('employee')
          .where({ id })
          .leftJoinAndSelect('employee.user', 'user')
          .leftJoinAndSelect('employee.periods', 'periods')
          .leftJoinAndSelect(
            'employee.vulnerability_periods',
            'vulnerability_periods',
          )
          .leftJoinAndSelect('periods.files', 'files')
          .leftJoinAndSelect('files.fileCategory', 'fileCategory')
          .leftJoinAndSelect(
            'employee.professional_title',
            'professional_title',
          )
          .leftJoinAndSelect('employee.education_level', 'education_level')
          .leftJoinAndSelect('employee.specialization', 'specialization')
          .getOne();

      if (!Employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      const subordinates = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoin('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .where('boss.id = :id', { id: id })
        .getMany();

      let _subordinates: EmployeeEntity[] = [];
      if (subordinates) {
        subordinates.forEach((sub) => _subordinates.push(sub.subordinate));
      }

      const boss = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoin('employee_command_chain.subordinate', 'subordinate')
        .where('subordinate.id = :id', { id: id })
        .getOne();

      return {
        ...Employee,
        subordinates: _subordinates,
        responds_to: boss?.boss,
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEmployeeByUserId(user_id: string) {
    try {
      const Employee: EmployeeEntity =
        await this.EmployeeRepository.createQueryBuilder('employee')
          .leftJoinAndSelect('employee.user', 'user')
          .leftJoinAndSelect(
            'employee.vulnerability_periods',
            'vulnerability_periods',
          )
          .where('user.id = :id', { id: user_id })
          .leftJoinAndSelect('employee.periods', 'periods')
          .leftJoinAndSelect('periods.files', 'files')
          .leftJoinAndSelect('files.fileCategory', 'fileCategory')
          .leftJoinAndSelect(
            'employee.professional_title',
            'professional_title',
          )
          .leftJoinAndSelect('employee.education_level', 'education_level')
          .leftJoinAndSelect('employee.specialization', 'specialization')
          .getOne();

      if (!Employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      const subordinates = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoin('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .leftJoinAndSelect('subordinate.user', 'user')
        .where('boss.id = :id', { id: Employee.id })
        .getMany();

      let _subordinates: EmployeeEntity[] = [];
      if (subordinates) {
        subordinates.forEach((sub) => _subordinates.push(sub.subordinate));
      }

      const boss = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoin('employee_command_chain.subordinate', 'subordinate')
        .where('subordinate.id = :id', { id: Employee.id })
        .getOne();

      return {
        ...Employee,
        subordinates: _subordinates,
        responds_to: boss?.boss,
      };
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEmployeePeriodById(id: string) {
    try {
      const Period = await this.PeriodsRepository.createQueryBuilder(
        'employee_periods',
      )
        .leftJoinAndSelect('employee_periods.employee', 'employee')
        .where('employee_periods.id = :id', { id: id })
        .getOne();

      const files = await this.FileService.findByEntityId(
        Period.id,
        FILE_ENTITY_NAMES.EMPLOYEE_PERIOD,
      );

      Period.files = files;

      return Period;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getBoss(id: string) {
    try {
      const commandChain = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('boss.user', 'user')
        .leftJoin('employee_command_chain.subordinate', 'subordinate')
        .leftJoinAndSelect('subordinate.user', 'sub_user')
        .where('subordinate.id = :id', { id: id })
        .getOne();

      return commandChain?.boss;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getCommandChain(id: string) {
    try {
      const employee = await this.findEmployeeById(id);

      if (employee.user_type !== ROLES.FACILITATOR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado no es facilitador',
        });
      }
      const manager = await this.getBoss(id);
      const coordinator = await this.getBoss(manager.id);

      return { manager, coordinator };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCommandChainFacilitators() {
    try {
      const chain = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .innerJoinAndSelect('employee_command_chain.boss', 'boss')
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .where('subordinate.user_type = :role', { role: ROLES.FACILITATOR })
        .getMany();

      let employees: EmployeeEntity[] = chain.map(
        (command_chain) => command_chain.subordinate,
      );

      return { data: employees };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateEmployee(
    id: string,
    body: EmployeeUpdateDTO,
    user_id: string,
    ip?: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const EmployeeToUpdate = await this.EmployeeRepository.findOneBy({ id });

      if (!EmployeeToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Empleado',
        });
      }
      const updateData: Partial<EmployeeEntity> = {
        name: body.name,
        position: body.position,
        code: body.code,
        address: body.address,
        phone: body.phone,
        facebook_profile: body.facebook_profile,
        salary: body.salary,
        marital_status: body.marital_status,

        sign_authorization: body.sign_authorization,
      };

      if (body.email) {
        const emailExists = await this.EmployeeRepository.findOneBy({
          email: body?.email,
        });

        if (emailExists && emailExists.id !== EmployeeToUpdate.id) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El correo introducido ya existe',
          });
        }

        updateData.email = body.email;
      }

      if (body?.professional_title?.id) {
        const professional_title =
          await this.ProfessionalTitleService.findProfessionalTitleById(
            body?.professional_title?.id,
          );
        updateData.professional_title = professional_title;
      }

      if (body?.education_level?.id) {
        const education_level =
          await this.EducationLevelService.findEducationLevelById(
            body?.education_level?.id,
          );
        updateData.education_level = education_level;
      }

      if (body.specialization?.id) {
        const specialization =
          await this.SpecializationService.findSpecializationById(
            body?.specialization?.id,
          );
        updateData.specialization = specialization;
      }

      if (body.periods?.length > 0) {
        await this.PeriodsRepository.createQueryBuilder('employee_periods')
          .leftJoin('employee_periods.employee', 'employee')
          .where('employee.id = :id', { id: EmployeeToUpdate?.id })
          .delete()
          .execute();

        for (let i = 0; i < body?.periods?.length; i++) {
          await this.PeriodsRepository.save({
            ...body.periods[i],
            employee: EmployeeToUpdate,
          });
        }
      }

      if (body.vulnerability_periods?.length > 0) {
        const v_periods =
          await this.EmployeeVulnerabilityPeriods.createQueryBuilder(
            'employee_vulnerability_period',
          )
            .leftJoinAndSelect(
              'employee_vulnerability_period.employee',
              'employee',
            )
            .where('employee.id = :id', { id: EmployeeToUpdate.id })
            .getMany();

        console.log(v_periods);

        const ids = v_periods.map((period) => period.id);

        if (ids?.length > 0) {
          await this.EmployeeVulnerabilityPeriods.delete(ids);
        }
        console.log(body);

        await body.vulnerability_periods.forEach(async (period) => {
          console.log(period);
          const saved = await this.EmployeeVulnerabilityPeriods.save({
            start_date: period.start_date ? new Date(period.start_date) : null,
            end_date: period.end_date ? new Date(period.end_date) : null,
            status: period.status,
            isDisabled:
              period.status === VULNERABILITY_STATUS.DISABLED ||
              !period.end_date ||
              (period.end_date && new Date(period.end_date) > new Date()),
            employee: EmployeeToUpdate,
          });

          if (period.status === VULNERABILITY_STATUS.DISABLED) {
            await this.EmployeeRepository.update(EmployeeToUpdate.id, {
              status: EMPLOYEE_STATUS.VULNERABLE,
            });
          }

          if (!period.end_date) {
            await this.EmployeeRepository.update(EmployeeToUpdate.id, {
              status: EMPLOYEE_STATUS.VULNERABLE,
            });
          }

          if (period.end_date && new Date(period.end_date) > new Date()) {
            await this.EmployeeRepository.update(EmployeeToUpdate.id, {
              status: EMPLOYEE_STATUS.VULNERABLE,
            });
          }
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'employee',
        entry_id: EmployeeToUpdate.id,
        ip,
      });

      return await this.EmployeeRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getEmployeeTransfer(
    page: number,
    limit: number,
    employee_id?: string,
    req?: Request,
  ) {
    try {
      const queryBuilder = this.EmployeeTransferRepository.createQueryBuilder(
        'employee_transfer',
      )
        .leftJoinAndSelect('employee_transfer.origin_point', 'origin_point')
        .leftJoinAndSelect(
          'employee_transfer.destination_point',
          'destination_point',
        )
        .leftJoinAndSelect('employee_transfer.employee', 'employee');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `employee_transfer.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} employee.name ILIKE '%${
            req.query.search
          }%' OR  employee.code ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      if (employee_id) {
        queryBuilder.andWhere('employee.id = :id', { id: employee_id });
      }

      if (req.roleUser === ROLES.FACILITATOR) {
        const employee = await this.findEmployeeByUserId(req.idUser);

        queryBuilder.andWhere('employee.id = :id', { id: employee.id });
      }

      const [transfers, totalElements] = await queryBuilder
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...transfers],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async transferEmployee(
    id: string,
    destination_id: string,
    reason: string,
    req: Request,
  ) {
    try {
      const employee = await this.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el empleado',
        });
      }

      if (employee.user_type !== ROLES.FACILITATOR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `El Empleado ${employee.name} no es facilitador`,
        });
      }

      const origin_point = await this.PointRepository.findOne({
        where: { facilitator_employee: { id: employee.id } },
        relations: { facilitator_employee: true },
      });

      const destination_point = await this.PointRepository.findOne({
        where: {
          id: destination_id,
        },
        relations: { coordinator_employee: true, manager_employee: true },
      });

      if (!origin_point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `El empleado ${employee.name} no esta asignado a un punto del encuentro`,
        });
      }

      if (!destination_point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el punto de destino',
        });
      }

      await this.PointRepository.update(destination_point.id, {
        facilitator_employee: employee,
      });

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: req?.idUser,
        entity: 'point',
        entry_id: destination_point?.id,
        ip: req?.ip,
      });

      const suspended_status = await this.PointStatusService.findBy({
        key: 'name',
        value: POINT_STATUS.SUSPENDED,
      });

      await this.PointRepository.update(origin_point.id, {
        facilitator_employee: null,
        status: suspended_status,
      });

      const security = new SecurityDTO();

      security.action = SECURITY_ACTION.EDIT;
      security.entity = 'point';
      security.entry_id = origin_point.id;
      security.ip = req.ip;
      security.made_on = new Date();
      security.user_id = req.idUser;

      await this.SecurityService.createSecurity(security);

      const newManager = destination_point?.manager_employee;

      const commandChain = await this.CommandChainRepository.createQueryBuilder(
        'employee_command_chain',
      )
        .leftJoinAndSelect('employee_command_chain.subordinate', 'subordinate')
        .where('subordinate.id = :id', { id: employee?.id })
        .getOne();

      if (commandChain) {
        await this.CommandChainRepository.update(commandChain?.id, {
          boss: newManager,
        });
      }

      return await this.EmployeeTransferRepository.save({
        employee: employee,
        origin_point: origin_point,
        destination_point: destination_point,
        reason: reason,
      });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateEmployeePeriod(
    id: string,
    period_id: string,
    body: EmployeePeriodUpdateDTO,
    files: Express.Multer.File[],
  ): Promise<UpdateResult | undefined> {
    try {
      const EmployeeToUpdate = await this.EmployeeRepository.findOneBy({ id });
      const PeriodToUpdate = await this.PeriodsRepository.findOneBy({
        id: period_id,
      });

      if (!EmployeeToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Empleado',
        });
      }

      if (!PeriodToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Periodo',
        });
      }
      const updateData: Partial<EmployeePeriodUpdateDTO> = {
        end_date: body.end_date,
      };
      const objUpdated = await this.PeriodsRepository.update(
        period_id,
        updateData,
      );

      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.EMPLOYEE_PERIOD,
          relationshipName: 'employee_period',
          valueRelationship: PeriodToUpdate.id,
        };
        await this.FileService.deleteAndCreateFile(files, optionsFiles);
      }

      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addFileToEmployeePeriod(
    id: string,
    files: Express.Multer.File[],
  ) {
    try {
      const PeriodToUpdate = await this.PeriodsRepository.findOneBy({
        id: id,
      });

      if (!PeriodToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Periodo',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: 'employee_period',
        relationshipName: 'employee_period',
        valueRelationship: PeriodToUpdate.id,
      };
      this.FileService.createFile(files, optionsFiles);
      return PeriodToUpdate;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async assignRoleToEmployee(
    id: string,
    role_name: string,
    body: AssignEmployeeRoleDTO,
  ) {
    try {
      const employee = await this.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      const role = await this.RolesService.findBy({
        key: 'role_value',
        value: role_name.toUpperCase(),
      });

      if (!role) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el rol',
        });
      }

      const updated_user: UserUpdateDTO = {
        role: role,
      };

      const updated_employee: Partial<EmployeeEntity> = {
        user_type: <any>role.role_value,
      };

      if (employee.status === EMPLOYEE_STATUS.UNNACTIVE) {
        updated_employee.status = EMPLOYEE_STATUS.ACTIVE;
      }

      if (role.role_value === ROLES.FACILITATOR) {
        if (!body.boss_id) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message:
              'Para asignar un empleado como facilitador debes proporcionar la id del gestor al cual respondera',
          });
        }

        const manager_employee =
          await this.EmployeeRepository.createQueryBuilder('employee')

            .where('id = :id', { id: body.boss_id })
            .getOne();

        if (!manager_employee) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No se pudo encontrar el Gestor',
          });
        }

        if (manager_employee.user_type !== ROLES.MANAGER) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El empleado proporcionado no tiene el rol Gestor',
          });
        }

        const commandChainObj = new EmployeeCommandChainEntity();
        commandChainObj.boss = manager_employee;
        commandChainObj.subordinate = employee;

        await this.CommandChainRepository.save(commandChainObj);
      }

      await this.EmployeeRepository.update(employee.id, updated_employee);

      return this.UserService.updateUser(employee?.user?.id, updated_user);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async assignRolesToEmployee(
    id: string,
    role_name: string
  ) {
    try {
      const employee = await this.findEmployeeById(id);


      const user = await this.UserService.findUserById(employee?.user?.id);

      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el user',
        });
      }
  
      const role = await this.RolesService.findBy({
        key: 'role_value',
        value: role_name,
      });
  
      if (!role) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el rol',
        });
      }

      const userRole = await this.UserService.findUserRolByRolAndUser(employee?.user?.id, role.id);

      if (userRole) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El usuario ya tiene asignado el rol',
        });
      }
  
      const userRolesObj = new UserRolesEntity();
      userRolesObj.user = user;
      userRolesObj.role = role;
  
      return await this.UserRolesRepository.save(userRolesObj);

    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  public async deleteRolesToEmployee(id: string): Promise<void> {
    try {
      // Encuentra los roles asociados al empleado
      const userRoles = await this.UserRolesRepository.find({
        where: { id:  id },
      });
  
      if (userRoles.length === 0) {
        throw new Error('No roles found for the specified employee');
      }
  
      // Elimina los roles encontrados
      await this.UserRolesRepository.remove(userRoles);
  
      console.log(`Roles for employee with id ${id} have been deleted`);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  public async AssignSubordinateToCoordinator(
    id: string,
    body: AssignEmployeeSubordinateDTO,
  ) {
    try {
      const employee = await this.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      if (employee.user_type !== ROLES.COORDINATOR) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado proporcionado no es coordinador',
        });
      }

      const sub_employee = await this.findEmployeeById(body.subordinate_id);

      if (!sub_employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado a asignar',
        });
      }

      if (sub_employee.user_type !== ROLES.MANAGER) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado proporcionado para asignar no es gestor',
        });
      }

      const alreadyAssigned =
        await this.CommandChainRepository.createQueryBuilder(
          'employee_command_chain',
        )
          .leftJoinAndSelect(
            'employee_command_chain.subordinate',
            'subordinate',
          )
          .where('subordinate.id = :id', { id: sub_employee.id })
          .getExists();

      if (alreadyAssigned) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El empleado proporcionado ya fue asignado como subordinado',
        });
      }

      const commandChainObj = new EmployeeCommandChainEntity();

      commandChainObj.boss = employee;
      commandChainObj.subordinate = sub_employee;

      return await this.CommandChainRepository.save(commandChainObj);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getUnnasignedEmployeesByRole(role: ROLES) {
    try {
      const employees = await this.EmployeeRepository.find({
        where: { user_type: role },
      });

      const assignedEmplopyees =
        await this.CommandChainRepository.createQueryBuilder(
          'employee_command_chain',
        )
          .leftJoinAndSelect(
            'employee_command_chain.subordinate',
            'subordinate',
          )
          .getMany();

      console.log(assignedEmplopyees);

      let notAssignedEmployees: EmployeeEntity[] = [];

      employees.forEach((employee) => {
        let exists = false;
        assignedEmplopyees.forEach((chain) => {
          if (employee?.id === chain?.subordinate?.id) {
            exists = true;
          }
        });

        if (!exists) {
          notAssignedEmployees.push(employee);
        }
      });

      return { data: notAssignedEmployees };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterEmployeeByRoleId(
    page: number,
    limit: number,
    role_id: string,
  ) {
    try {
      const queryBuilder =
        this.EmployeeRepository.createQueryBuilder('employee');

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Employee, totalElements] = await queryBuilder
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.role.id = :id', { id: role_id })
        .leftJoinAndSelect('employee.periods', 'periods')
        .leftJoinAndSelect('periods.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .leftJoinAndSelect('employee.professional_title', 'professional_title')
        .leftJoinAndSelect('employee.education_level', 'education_level')
        .leftJoinAndSelect('employee.specialization', 'specialization')
        .orderBy('employee.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Employee],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterEmployeeByRoleName(
    page: number,
    limit: number,
    role_value: ROLES,
  ) {
    try {
      const role = await this.RolesService.findBy({
        key: 'role_value',
        value: role_value.toUpperCase(),
      });

      if (!role) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el rol',
        });
      }

      const queryBuilder =
        this.EmployeeRepository.createQueryBuilder('employee');

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Employee, totalElements] = await queryBuilder
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.role.id = :id', { id: role.id })
        .leftJoinAndSelect('employee.periods', 'periods')
        .leftJoinAndSelect('employee.professional_title', 'professional_title')
        .leftJoinAndSelect('employee.education_level', 'education_level')
        .leftJoinAndSelect('employee.specialization', 'specialization')
        //.orderBy('employee.updatedAt', 'DESC')
        .orderBy('employee.name', 'ASC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Employee],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addPeriodToEmployee(id: string, period: EmployeePeriodDTO) {
    try {
      const employee = await this.EmployeeRepository.findOneBy({
        id: id,
      });

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el empleado',
        });
      }

      const objperiod = new EmployeePeriodsEntity();

      objperiod.start_date = period.start_date;
      objperiod.end_date = period.end_date;
      objperiod.employee = employee;

      return this.PeriodsRepository.save(objperiod);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteEmployee(
    id: string,
    user_id?: string,
    ip?: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const employeeToDelete = await this.EmployeeRepository.findOneBy({ id });

      await this.CommandChainRepository.delete({ boss: employeeToDelete });
      await this.CommandChainRepository.delete({
        subordinate: employeeToDelete,
      });

      const uuid = v4();
      await this.EmployeeRepository.update(id, {
        id_value: `${employeeToDelete?.id_value}_deleted_${uuid}`,
        email: `${employeeToDelete?.email}_deleted_${uuid}`,
      });

      const Employee: DeleteResult = await this.EmployeeRepository.softDelete(
        id,
      );
      if (Employee.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      const security: SecurityDTO = {
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        entity: 'employee',
        entry_id: id,
        user_id: user_id,
        ip,
      };

      await this.SecurityService.createSecurity(security);

      return Employee;
    } catch (error) {
      console.log(error);
      console.log(
        '%cemployee.service.ts line:1570 error',
        'color: #007acc;',
        error,
      );
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteEmployeePeriod(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const period: DeleteResult = await this.PeriodsRepository.softDelete(id);
      if (period.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return period;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Add a type declaration for 'sn'
  private async getUsername(name: string): Promise<string> {
    const names = name.split(' ');

    const config: Config = {
      dictionaries: [names],
      separator: '',
      style: 'lowerCase',
      randomDigits: 4,
    };

    let username = uniqueUsernameGenerator(config);

    const user = await this.UserService.findBy({
      key: 'username',
      value: username,
    });

    if (!user) {
      return username;
    }

    return await this.getUsername(name);
  }
}
