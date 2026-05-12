import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointEntity } from '../entities/point.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  PointAvailabilityDTO,
  PointDTO,
  PointFiltersDTO,
  PointReportsDTO,
  PointResultDTO,
  PointUpdateDTO,
} from '../dto/point.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { PointStatusService } from 'src/modules/nomencladores/point-status/services/point-status.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { BeneficiaryService } from 'src/modules/beneficiary/services/beneficiary.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { ROLES } from 'src/constants';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FileService } from 'src/modules/file/services/file.service';
import {
  EMPLOYEE_STATUS,
  FILE_ENTITY_NAMES,
  MODULES_NAMES,
  POINT_STATUS,
} from 'src/constants/enums';
import e, { Request } from 'express';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { SecurityService } from 'src/modules/security/services/security.service';
import { PointStatusEntity } from 'src/modules/nomencladores/point-status/entities/point-status.entity';
import { DisconnectionIncidentEntity } from 'src/modules/incident/entities/disconnection-incident.entity';
import { CitizenPointEntity } from '../entities/citizen-point.entity';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
//import { VisitRecordService } from 'src/modules/visit-record/services/VisitRecordService';
//import { VisitRecordEntity } from 'src/modules/visit-record/entities/visit-record.entity';
import { PointVisitsEntity } from '../entities/point-visits.entity';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { PointAssetsEntity } from '../entities/point-assets.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';
import { SecurityLogsEntity } from 'src/modules/security/entities/security.entity';
import { PointHistoryEntity } from '../entities/point-history.entity';
import { ProvinceEntity } from 'src/modules/nomencladores/geolocation/entities/province.entity';
import { CantonEntity } from 'src/modules/nomencladores/geolocation/entities/canton.entity';
import { PointGeolocationStatusEntity } from '../entities/point-by-geolocation.entity';
import { PointGeolocationVisitsEntity } from '../entities/point-visit-by-geeolocation.entity';
import {
  ICantonData,
  ICourseGeolocation,
  IParishVisitCountPerType,
  IProvinceData,
  IProvincePdeCountPerStatus,
  IVisitData,
} from '../interfaces/point.interface';
import { PointCalculationsAvailabilityViewEntity } from '../entities/point_calculations_availability_view.entity';
import { PointAvailabilityViewEntity } from '../entities/point_availability_view.entity';
import { EmployeeCommandChainEntity } from 'src/modules/employee/entities/employee_command_chain.entity';
import { CoursesListGeolocationViewEntity } from '../entities/courses_list_geolocation_view.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,
    @InjectRepository(DisconnectionIncidentEntity)
    private readonly DisconnectionIncidentRepository: Repository<DisconnectionIncidentEntity>,
    @InjectRepository(CitizenPointEntity)
    private readonly CitizenPointRepository: Repository<CitizenPointEntity>,
    @InjectRepository(CitizenEntity)
    private readonly CitizenRepository: Repository<CitizenEntity>,
    @InjectRepository(PointVisitsEntity)
    private readonly PointVisitsRepository: Repository<PointVisitsEntity>,
    @InjectRepository(CourseEntity)
    private readonly CourseRepository: Repository<CourseEntity>,
    @InjectRepository(ConectivityEntity)
    private readonly ConectivityRepository: Repository<ConectivityEntity>,
    @InjectRepository(PointAssetsEntity)
    private readonly PointAssetsRepository: Repository<PointAssetsEntity>,
    @InjectRepository(PointHistoryEntity)
    private readonly PointHistoryRepository: Repository<PointHistoryEntity>,
    @InjectRepository(EmployeeCommandChainEntity)
    private readonly CommandChainRepository: Repository<EmployeeCommandChainEntity>,

    @InjectRepository(ProvinceEntity)
    private readonly ProvinceRepository: Repository<ProvinceEntity>,

    @InjectRepository(CantonEntity)
    private readonly CantonRepository: Repository<CantonEntity>,

    @InjectRepository(PointGeolocationStatusEntity)
    private readonly PointByGeolocationRepository: Repository<PointGeolocationStatusEntity>,

    @InjectRepository(PointGeolocationVisitsEntity)
    private readonly PointByGeolocationVisitsRepository: Repository<PointGeolocationVisitsEntity>,

    @InjectRepository(SecurityLogsEntity)
    private readonly SecurityLogsRepository: Repository<SecurityLogsEntity>,

    @InjectRepository(PointCalculationsAvailabilityViewEntity)
    private readonly pointCalculationsAvailabilityRepository: Repository<PointCalculationsAvailabilityViewEntity>,

    @InjectRepository(PointAvailabilityViewEntity)
    private readonly pointAvailabilityRepository: Repository<PointAvailabilityViewEntity>,

    @InjectRepository(CoursesListGeolocationViewEntity)
    private readonly CoursesListGeolocationRepository: Repository<CoursesListGeolocationViewEntity>,

    private readonly PointStatusService: PointStatusService,
    private readonly AddressService: AddressService,
    private readonly EmployeeService: EmployeeService,
    private readonly BeneficiaryService: BeneficiaryService,
    private readonly UsersService: UsersService,
    private readonly fileService: FileService,
    private readonly SecurityService: SecurityService,
    private readonly CitizenService: CitizenService,
  ) {}

  public async createPoint(
    body: PointDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<PointEntity> {
    try {
      const objPoint = new PointEntity();
      objPoint.name = body.name;
      objPoint.code = body.code;
      objPoint.observations = body.observations;
      objPoint.isCsr = body.isCsr;
      objPoint.hasAgreements = body.hasAgreements;
      objPoint.ip = body.ip;
      objPoint.type = body.type;
      objPoint.agreement = body.agreement;

      if (body?.address?.id) {
        const address = await this.AddressService.findAddressById(
          body?.address?.id,
        );

        objPoint.address = address;
      }

      if (body?.status?.id) {
        const status = await this.PointStatusService.findPointStatusById(
          body?.status?.id,
        );

        objPoint.status = status;
      }

      if (body?.facilitator_employee?.id) {
        const facilitator = await this.EmployeeService.findEmployeeById(
          body?.facilitator_employee?.id,
        );

        const isFacilitator = await this.UsersService.getRoleByUserId(
          facilitator?.user?.id,
        );

        if (isFacilitator !== ROLES.FACILITATOR) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `El empleado ${facilitator?.name} no es facilitador`,
          });
        }

        const alreadyAssigned = await this.PointRepository.createQueryBuilder(
          'point',
        )
          .leftJoinAndSelect(
            'point.facilitator_employee',
            'facilitator_employee',
          )
          .where('facilitator_employee.id = :id', { id: facilitator?.id })
          .getExists();

        if (alreadyAssigned) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `El empleado ${facilitator?.name} ya fue asignado como facilitador de otro punto del encuentro`,
          });
        }

        const manager_employee = await this.EmployeeService.getBoss(
          facilitator?.id,
        );
        const coordinator_employee = await this.EmployeeService.getBoss(
          manager_employee?.id,
        );

        objPoint.facilitator_employee = facilitator;
        objPoint.manager_employee = manager_employee;
        objPoint.coordinator_employee = coordinator_employee;
      } else {
        const innactive_status = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.UNNACTIVE,
        });

        objPoint.status = innactive_status;
      }

      if (body?.technical_asistent_employee?.id) {
        const technical_asistent = await this.EmployeeService.findEmployeeById(
          body?.technical_asistent_employee?.id,
        );

        const isTechAsitent = await this.UsersService.getRoleByUserId(
          technical_asistent?.user?.id,
        );

        if (isTechAsitent !== ROLES.TECHNICAL_ASSISTENT) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `El empleado ${technical_asistent?.name} no es asistente tecnico`,
          });
        }

        objPoint.technical_asistent_employee = technical_asistent;
      }

      if (body?.beneficiary?.id) {
        const beneficiary = await this.BeneficiaryService.findBeneficiaryById(
          body?.beneficiary?.id,
        );

        objPoint.beneficiary = beneficiary;
      }

      const PointSaved = await this.PointRepository.save(objPoint);

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.POINT,
          relationshipName: 'point',
          valueRelationship: PointSaved?.id,
        };
        this.fileService.createFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'point',
        entry_id: PointSaved.id,
        ip,
      });

      return PointSaved;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addFiles(id: string, files: Express.Multer.File[]) {
    try {
      const point = await this.PointRepository.findOneBy({ id });

      if (!point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Punto de encuentro',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: 'point',
        relationshipName: 'point',
        valueRelationship: point?.id,
      };
      this.fileService.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getPointByFacilitator(id: string) {
    try {
      // where: { facilitator_employee: { id } },
      //   relations: { facilitator_employee: true },
      const point = await this.PointRepository.findOne({
        where: { facilitator_employee: { id } },
        relations: [
          'facilitator_employee',
          'address',
          'address.parish',
          'address.parish.canton',
          'address.parish.canton.province',
          'address.parish.canton.province.region',
          'address.parish.canton.province.region.country',
        ],
      });

      return point;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async assignCitizen(user_id: string, citizen_id: string) {
    try {
      const citizen = await this.CitizenService.findCitizenById(citizen_id);

      if (!citizen) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el ciudadano',
        });
      }

      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const point = await this.PointRepository.findOne({
        where: { facilitator_employee: { id: employee.id } },
        relations: { facilitator_employee: true },
      });

      if (!point) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: `El empleado ${employee.name} no esta asignado a ningun punto de encuentro`,
        });
      }

      const objCitizenPoint = new CitizenPointEntity();

      objCitizenPoint.citizen = citizen;
      objCitizenPoint.point = point;

      await this.CitizenRepository.update(citizen.id, { point: point });
      return await this.CitizenPointRepository.save(objCitizenPoint);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPoint(
    page: number,
    limit: number,
    req: Request,
  ): Promise<PointResultDTO> {
    try {
      const queryBuilder = this.PointRepository.createQueryBuilder('point');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `point.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} point.name ILIKE '%${
            req.query.search
          }%' OR  point.code ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      if (req?.roleUser === ROLES.MANAGER) {
        const employee = await this.EmployeeService.findEmployeeByUserId(
          req?.idUser,
        );
        const subIds = employee?.subordinates?.map((e) => e?.id);
        queryBuilder.andWhere('point.facilitator_employee_id IN (:...ids)', {
          ids: subIds,
        });
      }
      if (req?.roleUser === ROLES.COORDINATOR) {
        const employee = await this.EmployeeService.findEmployeeByUserId(
          req?.idUser,
        );
        const subIds = employee?.subordinates?.map((e) => e?.id);

        const commandChain =
          await this.CommandChainRepository.createQueryBuilder(
            'employee_command_chain',
          )
            .leftJoinAndSelect('employee_command_chain.boss', 'boss')
            .leftJoinAndSelect(
              'employee_command_chain.subordinate',
              'subordinate',
            )
            .where('boss.id IN (:...ids)', { ids: subIds })
            .getMany();

        let ids = commandChain.map((e) => e?.subordinate?.id);
        queryBuilder.andWhere('point.facilitator_employee_id IN (:...ids)', {
          ids,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Point, totalElements] = await queryBuilder
        .leftJoinAndSelect('point.status', 'status')
        .leftJoinAndSelect('point.address', 'address')
        .leftJoinAndSelect('address.parish', 'parish')
        .leftJoinAndSelect('parish.canton', 'canton')
        .leftJoinAndSelect('canton.province', 'province')
        .leftJoinAndSelect('province.region', 'region')
        .leftJoinAndSelect('point.conectivity', 'conectivity')
        .leftJoinAndSelect('conectivity.technology', 'technology')
        .leftJoinAndSelect('conectivity.sharing', 'sharing')
        .leftJoinAndSelect('conectivity.serviceStatus', 'serviceStatus')
        .leftJoinAndSelect('conectivity.speed', 'speed')
        .leftJoinAndSelect('conectivity.workOrder', 'workOrder')
        .leftJoinAndSelect('point.facilitator_employee', 'facilitator_employee')
        .leftJoinAndSelect(
          'facilitator_employee.vulnerability_periods',
          'vulnerability_periods',
        )
        .leftJoinAndSelect(
          'point.technical_asistent_employee',
          'technical_asistent_employee',
        )
        .leftJoinAndSelect('point.beneficiary', 'beneficiary')
        .leftJoinAndSelect('point.manager_employee', 'manager_employee')
        .leftJoinAndSelect('point.coordinator_employee', 'coordinator_employee')
        .leftJoinAndSelect('point.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .orderBy('point.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Point],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof PointDTO; value: any }) {
    try {
      const Point = await this.PointRepository.createQueryBuilder('point')
        .where({ [key]: value })
        .leftJoinAndSelect('point.status', 'status')
        .leftJoinAndSelect('point.address', 'adress')
        .leftJoinAndSelect('point.facilitator_employee', 'facilitator')
        .leftJoinAndSelect(
          'point.technical_asistent_employee',
          'technical_asistent',
        )
        .leftJoinAndSelect('point.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .leftJoinAndSelect('point.beneficiary', 'beneficiary')
        .getOne();

      const files = await this.fileService.findByEntityId(
        Point.id,
        FILE_ENTITY_NAMES.POINT,
      );

      Point.files = files;

      return Point;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getPointHistoricalReport(point_id: string) {
    try {
      const point = await this.PointRepository.findOne({
        where: { id: point_id },
        relations: {
          beneficiary: true,
          facilitator_employee: true,
          coordinator_employee: true,
          manager_employee: true,
          technical_asistent_employee: true,
          address: { parish: { canton: { province: { region: true } } } },
        },
      });

      let Historial: PointHistoryEntity[] = [];

      const security_logs = await this.SecurityLogsRepository.find({
        where: {
          entity: 'point',
          entry_id: point.id,
          action: SECURITY_ACTION.EDIT,
        },
      });

      for (let i = 0; i < security_logs.length; i++) {
        const PointHistory = await this.PointHistoryRepository.findOne({
          where: { security: { id: security_logs[i].id } },
          relations: {
            security: true,
            beneficiary: true,
            facilitator_employee: true,
            coordinator_employee: true,
            manager_employee: true,
            technical_asistent_employee: true,
            address: true,
            changed_by: true,
          },
          order: { changedAt: { direction: 'DESC' } },
        });
        if (PointHistory) {
          Historial.push(PointHistory);
        }
      }

      return {
        point,
        historial: [...Historial],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getMemoryAidReport(province_id: string, canton_id?: string) {
    try {
      let ProvinceData: Partial<IProvinceData> = {};
      const province = await this.ProvinceRepository.findOneBy({
        id: province_id,
      });

      ProvinceData.province_name = province.name;

      const canton_count = await this.PointByGeolocationRepository.query(`SELECT
      point_geolocation_status_entity.canton_name, 
      count(point_geolocation_status_entity."id")
      
    FROM
      point_geolocation_status_entity
    WHERE
      point_geolocation_status_entity.province_id = '${province.id}'
    GROUP BY
      point_geolocation_status_entity.canton_name
      `);

      ProvinceData.pde_per_canton = canton_count;

      const total_pde_count = await this.PointByGeolocationRepository.count({
        where: {
          province_id: province.id,
        },
      });

      ProvinceData.total_pde = total_pde_count;

      const total_pde_per_status = await this.PointByGeolocationRepository
        .query(`SELECT
      count(point_geolocation_status_entity."id"), 
      point_geolocation_status_entity.parish_name, 
      point_geolocation_status_entity.status
    FROM
      point_geolocation_status_entity
    WHERE
      point_geolocation_status_entity.province_id = '${province.id}'
    GROUP BY
      point_geolocation_status_entity.parish_name, 
      point_geolocation_status_entity.status`);

      let count_per_status: IProvincePdeCountPerStatus[] = [];

      let status = [];

      total_pde_per_status.forEach((pde) => {
        if (!status.find((stat) => stat === pde.status)) {
          status.push(pde.status);
        }
      });

      status.forEach((stat) => {
        let status_count: IProvincePdeCountPerStatus = {
          status: stat,
          parish_pdes: [],
          total: 0,
        };
        total_pde_per_status?.forEach((pde) => {
          if (pde.status === stat) {
            status_count.parish_pdes.push({
              parish_name: pde.parish_name,
              pde_count: pde.count,
            });
            status_count.total = +status_count.total + +pde.count;
          }
        });

        count_per_status.push(status_count);
      });

      ProvinceData.pde_per_status = count_per_status;

      let visitData: IVisitData = {
        population_visit: 0,
        visit_number: 0,
        trained: 0,
        parish_number: 0,
        canton_number: 0,
      };

      const population_visit = await this.PointByGeolocationVisitsRepository
        .query(`SELECT DISTINCT
      point_geolocation_visits_entity.citizen_id
    FROM
      point_geolocation_visits_entity
    WHERE
      point_geolocation_visits_entity.province_id = '${province.id}'`);

      visitData.population_visit = population_visit.length;

      const visit_number = await this.PointByGeolocationVisitsRepository.query(`
      SELECT 
	count(point_geolocation_visits_entity.citizen_id)
FROM
	point_geolocation_visits_entity
WHERE
	point_geolocation_visits_entity.province_id = '${province.id}'`);

      visitData.visit_number = Number(visit_number[0].count);

      const trainings = await this.PointByGeolocationVisitsRepository
        .query(`SELECT DISTINCT
	point_geolocation_visits_entity.citizen_id
FROM
	point_geolocation_visits_entity
WHERE
	(point_geolocation_visits_entity.province_id = '${province.id}') AND
	(point_geolocation_visits_entity.visit_type = 'Virtual' OR
	point_geolocation_visits_entity.visit_type = 'En sitio')`);

      visitData.trained = trainings.length;

      const parish_number = await this.PointByGeolocationVisitsRepository
        .query(`SELECT DISTINCT
    point_geolocation_visits_entity.parish_id
  FROM
    point_geolocation_visits_entity
  WHERE
    point_geolocation_visits_entity.province_id = '${province.id}'`);

      visitData.parish_number = parish_number.length;

      const canton_number = await this.PointByGeolocationVisitsRepository
        .query(`SELECT DISTINCT
    point_geolocation_visits_entity.canton_id
  FROM
    point_geolocation_visits_entity
  WHERE
    point_geolocation_visits_entity.province_id = '${province.id}'`);

      visitData.canton_number = canton_number.length;

      ProvinceData.province_general_data = visitData;

      if (canton_id) {
        const canton = await this.CantonRepository.findOneBy({ id: canton_id });

        const CantonData: Partial<ICantonData> = {
          canton_name: canton.name,
        };

        let visitData: IVisitData = {
          population_visit: 0,
          visit_number: 0,
          trained: 0,
          parish_number: 0,
          canton_number: 0,
        };

        const population_visit = await this.PointByGeolocationVisitsRepository
          .query(`SELECT DISTINCT
        point_geolocation_visits_entity.citizen_id
      FROM
        point_geolocation_visits_entity
      WHERE
        point_geolocation_visits_entity.canton_id = '${canton.id}'`);

        visitData.population_visit = population_visit.length;

        const visit_number = await this.PointByGeolocationVisitsRepository
          .query(`
        SELECT 
    count(point_geolocation_visits_entity.citizen_id)
  FROM
    point_geolocation_visits_entity
  WHERE
  point_geolocation_visits_entity.canton_id = '${canton.id}'`);

        visitData.visit_number = Number(visit_number[0].count);

        const trainings = await this.PointByGeolocationVisitsRepository
          .query(`SELECT DISTINCT
    point_geolocation_visits_entity.citizen_id
  FROM
    point_geolocation_visits_entity
  WHERE
  (point_geolocation_visits_entity.canton_id = '${canton.id}') AND
    (point_geolocation_visits_entity.visit_type = 'Virtual' OR
    point_geolocation_visits_entity.visit_type = 'En sitio')`);

        visitData.trained = trainings.length;

        const parish_number = await this.PointByGeolocationVisitsRepository
          .query(`SELECT DISTINCT
      point_geolocation_visits_entity.parish_id
    FROM
      point_geolocation_visits_entity
    WHERE
    point_geolocation_visits_entity.canton_id = '${canton.id}'`);

        visitData.parish_number = parish_number.length;

        const canton_number = await this.PointByGeolocationVisitsRepository
          .query(`SELECT DISTINCT
      point_geolocation_visits_entity.canton_id
    FROM
      point_geolocation_visits_entity
    WHERE
    point_geolocation_visits_entity.canton_id = '${canton.id}'`);

        visitData.canton_number = canton_number.length;

        CantonData.canton_general_data = visitData;

        const parish_count = await this.PointByGeolocationRepository
          .query(`SELECT
        point_geolocation_status_entity.parish_name, 
        count(point_geolocation_status_entity."id")
        
      FROM
        point_geolocation_status_entity
      WHERE
        point_geolocation_status_entity.canton_id = '${canton.id}'
      GROUP BY
        point_geolocation_status_entity.parish_name
      `);

        CantonData.pde_per_parish = parish_count;

        const total_pde_per_parish_count =
          await this.PointByGeolocationRepository.count({
            where: {
              canton_id: canton.id,
            },
          });

        CantonData.total_pde_per_parish = total_pde_per_parish_count;

        const total_pde_per_status = await this.PointByGeolocationRepository
          .query(`SELECT
    count(point_geolocation_status_entity."id"), 
    point_geolocation_status_entity.parish_name, 
    point_geolocation_status_entity.status
  FROM
    point_geolocation_status_entity
  WHERE
    point_geolocation_status_entity.canton_id = '${canton.id}'
  GROUP BY
    point_geolocation_status_entity.parish_name, 
    point_geolocation_status_entity.status`);

        let count_per_status: IProvincePdeCountPerStatus[] = [];

        let status = [];

        total_pde_per_status.forEach((pde) => {
          if (!status.find((stat) => stat === pde.status)) {
            status.push(pde.status);
          }
        });

        status.forEach((stat) => {
          let status_count: IProvincePdeCountPerStatus = {
            status: stat,
            parish_pdes: [],
            total: 0,
          };
          total_pde_per_status?.forEach((pde) => {
            if (pde.status === stat) {
              status_count.parish_pdes.push({
                parish_name: pde.parish_name,
                pde_count: pde.count,
              });
              status_count.total = +status_count.total + +pde.count;
            }
          });

          count_per_status.push(status_count);
        });

        CantonData.pde_per_status = count_per_status;

        let ParishVisitCount: IParishVisitCountPerType = {
          visits: [],
          trained: [],
          total_trained: 0,
          total_visits: 0,
        };

        const visits = await this.PointByGeolocationVisitsRepository
          .query(`SELECT
    point_geolocation_visits_entity.parish_name, 
    count(point_geolocation_visits_entity.citizen_id)
  FROM
    point_geolocation_visits_entity
  WHERE
    point_geolocation_visits_entity.canton_id = '${canton.id}'
  GROUP BY
    point_geolocation_visits_entity.parish_name`);

        ParishVisitCount.visits = visits;

        visits.forEach((visit) => {
          ParishVisitCount.total_visits =
            Number(ParishVisitCount.total_visits) + Number(visit.count);
        });

        const trained = await this.PointByGeolocationVisitsRepository
          .query(`SELECT
        point_geolocation_visits_entity.parish_name, 
        count(point_geolocation_visits_entity.citizen_id)
      FROM
        point_geolocation_visits_entity
      WHERE
        (point_geolocation_visits_entity.canton_id = '${canton.id}') AND
        (point_geolocation_visits_entity.visit_type = 'Virtual' OR point_geolocation_visits_entity.visit_type = 'En sitio')
      GROUP BY
        point_geolocation_visits_entity.parish_name`);

        ParishVisitCount.trained = trained;

        trained.forEach((training) => {
          ParishVisitCount.total_trained =
            Number(ParishVisitCount.total_trained) + Number(training.count);
        });

        CantonData.parish_visits_data = ParishVisitCount;

        ProvinceData.canton_data = CantonData;
      }
      if (process.env.EXTRA_FEATURES){
        // Se obtiene la lista de cursos de la provincia y/o cantón
          let query = `
          SELECT name, start_date, end_date 
          FROM courses_list_geolocation_view_entity
          WHERE courses_list_geolocation_view_entity.province_id = '${province_id}'
        `;
        if (canton_id) {
          query += ` AND courses_list_geolocation_view_entity.canton_id = '${canton_id}'`;
        }
        query += ` ORDER BY name`;
        console.log("se consulta lista de cursos");
        const courses = await this.CoursesListGeolocationRepository.query(query);
        if(courses){
          if (!ProvinceData.courses_list) {
            ProvinceData.courses_list = [];
          }
          courses.forEach((course: ICourseGeolocation) => {       
            ProvinceData.courses_list.push(course);          
          });    
        }      
      }      
      //console.log(ProvinceData);
      return ProvinceData;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPointById(id: string) {
    try {
      const Point: PointEntity = await this.PointRepository.createQueryBuilder(
        'point',
      )
        .where({ id: id })
        .leftJoinAndSelect('point.status', 'status')
        .leftJoinAndSelect('point.address', 'address')
        .leftJoinAndSelect('address.parish', 'parish')
        .leftJoinAndSelect('parish.canton', 'canton')
        .leftJoinAndSelect('canton.province', 'province')
        .leftJoinAndSelect('province.region', 'region')
        .leftJoinAndSelect('point.conectivity', 'conectivity')
        .leftJoinAndSelect('conectivity.technology', 'technology')
        .leftJoinAndSelect('conectivity.sharing', 'sharing')
        .leftJoinAndSelect('conectivity.serviceStatus', 'serviceStatus')
        .leftJoinAndSelect('conectivity.speed', 'speed')
        .leftJoinAndSelect('conectivity.workOrder', 'workOrder')
        .leftJoinAndSelect('point.facilitator_employee', 'facilitator')
        .leftJoinAndSelect('point.manager_employee', 'manager_employee')
        .leftJoinAndSelect('point.coordinator_employee', 'coordinator_employee')
        .leftJoinAndSelect(
          'facilitator.vulnerability_periods',
          'vulnerability_periods',
        )
        .leftJoinAndSelect(
          'point.technical_asistent_employee',
          'technical_asistent',
        )
        .leftJoinAndSelect('point.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .leftJoinAndSelect('point.beneficiary', 'beneficiary')
        .getOne();

      const files = await this.fileService.findByEntityId(
        Point?.id,
        FILE_ENTITY_NAMES.POINT,
      );

      let point_data = null;
      if (Point) {
        Point.files = files;
        point_data = await this.getReportDataFromPoint(Point.id);
      }

      return { ...Point, ...point_data };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPointByIdTemp(id: string) {
    try {
      const Point: PointEntity = await this.PointRepository.createQueryBuilder(
        'point',
      )
        .where({ id: id })
        .leftJoinAndSelect('point.address', 'adress')
        .getOne();

      return { ...Point };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getReportDataFromPoint(
    point_id: string,
  ): Promise<PointReportsDTO> {
    try {
      let temp_visitas = 0;
      let total_visits = await this.PointVisitsRepository.count({
        where: { point_id: point_id },
      });

      const login_count = await this.PointVisitsRepository.count({
        where: {
          visit_type_value: VISIT_TYPES.FACE_TO_FACE,
          point_id: point_id,
        },
      });

      const virtual_visits = await this.PointVisitsRepository.count({
        where: { visit_type_value: VISIT_TYPES.VIRTUAL, point_id: point_id },
      });

      const facetoface_visits = await this.PointVisitsRepository.count({
        where: { visit_type_value: VISIT_TYPES.ON_SITE, point_id: point_id },
      });

      const service_visits = await this.PointVisitsRepository.count({
        where: { visit_type_value: VISIT_TYPES.VISIT, point_id: point_id },
      });

      const total_courses = await this.CourseRepository.count({
        where: { point: { id: point_id } },
        relations: { point: true },
      });

      const point_assets = await this.PointAssetsRepository.find({
        where: { point_id: point_id },
      });

      const point_conectivities = await this.ConectivityRepository.find({
        where: { point: { id: point_id } },
        relations: { point: true },
      });
      temp_visitas = login_count + virtual_visits + facetoface_visits + service_visits;
      if (total_visits != temp_visitas){
        total_visits = temp_visitas;
      }
      //console.log("login="+login_count + ", virtual="+virtual_visits+", presencial="+facetoface_visits + ", servicios="+service_visits);
      return {
        total_visits,
        total_courses,
        virtual_visits,
        facetoface_visits,
        service_visits,
        point_assets,
        login_count,
        point_conectivities,
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getPointAssets(id?: string) {
    try {
      const queryBuilder = this.PointAssetsRepository.createQueryBuilder(
        'point_assets_entity',
      );

      if (id) {
        queryBuilder.where('point_assets_entity.point_id = :id', { id });
      }

      const assets = await queryBuilder.getMany();

      let arranged_assets = [];

      let point_data = [];

      assets.forEach((asset) => {
        if (!point_data.find((data) => data.point_id === asset.point_id)) {
          point_data.push({
            point_id: asset.point_id,
            point_name: asset.point_name,
          });
        }
      });

      point_data.forEach((point) => {
        let arranged_asset_obj = {
          point_id: point.point_id,
          point_name: point.point_name,
          assets: [],
        };

        assets.forEach((asset) => {
          if (asset.point_id === point.point_id) {
            arranged_asset_obj.assets.push(asset);
          }
        });

        arranged_assets.push(arranged_asset_obj);
      });

      return arranged_assets;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePoint(
    id: string,
    body: PointUpdateDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const PointToUpdate = await this.PointRepository.findOne({
        where: { id },
        relations: { facilitator_employee: true },
      });

      if (!PointToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la puntos de encuentro',
        });
      }
      const updateData: Partial<PointEntity> = {
        name: body.name,
        isCsr: body.isCsr,
        observations: body.observations,
        hasAgreements: body.hasAgreements,
        ip: body.ip,
        type: body.type,
        agreement: body.agreement,
        code: body.code,
      };

      if (body.facilitator_employee?.id) {
        const facilitator = await this.EmployeeService.findEmployeeById(
          body.facilitator_employee?.id,
        );

        if (facilitator.user_type !== ROLES.FACILITATOR) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `El Empleado ${facilitator.name} no es facilitador`,
          });
        }

        const status_suspended = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.SUSPENDED,
        });
        const status_active = await this.PointStatusService.findBy({
          key: 'name',
          value: POINT_STATUS.ACTIVE,
        });

        let final_status: PointStatusEntity;

        const Incident = await this.DisconnectionIncidentRepository.findOne({
          where: { point: { id: PointToUpdate.id } },
          relations: {
            point: true,
          },
        });
        if (
          PointToUpdate.facilitator_employee?.status ===
            EMPLOYEE_STATUS.UNNACTIVE &&
          Incident.solved_date === null
        ) {
          final_status = status_suspended;
        }

        if (
          PointToUpdate.facilitator_employee?.status ===
            EMPLOYEE_STATUS.UNNACTIVE &&
          !Incident
        ) {
          final_status = status_active;
        }

        if (!PointToUpdate.facilitator_employee) {
          if (body.status?.id) {
            const status = await this.PointStatusService.findPointStatusById(
              body.status?.id,
            );

            final_status = status;
          } else {
            final_status = status_active;
          }
        }

        if (final_status) {
          console.log('test');
          console.log(final_status);
          updateData.status = final_status;
        }

        updateData.facilitator_employee = facilitator;

        const boss_manager = await this.EmployeeService.getBoss(facilitator.id);
        const boss_coordinator = await this.EmployeeService.getBoss(
          boss_manager.id,
        );

        updateData.manager_employee = boss_manager;
        updateData.coordinator_employee = boss_coordinator;
      }

      if (body.technical_asistent_employee?.id) {
        const technical_assistent = await this.EmployeeService.findEmployeeById(
          body.technical_asistent_employee?.id,
        );

        if (technical_assistent.user_type !== ROLES.TECHNICAL_ASSISTENT) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: `El Empleado ${technical_assistent.name} no es asistente tecnico`,
          });
        }

        updateData.technical_asistent_employee = technical_assistent;
      }

      if (body.beneficiary?.id) {
        const beneficiary = await this.BeneficiaryService.findBeneficiaryById(
          body.beneficiary?.id,
        );

        updateData.beneficiary = beneficiary;
      }

      if (body?.status?.id) {
        const status = await this.PointStatusService.findPointStatusById(
          body?.status?.id,
        );

        updateData.status = status;
      }

      const objUpdated = await this.PointRepository.update(id, updateData);

      const security = await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'point',
        entry_id: PointToUpdate.id,
        ip,
      });

      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.POINT,
          relationshipName: 'point',
          valueRelationship: PointToUpdate.id,
        };
        await this.fileService.deleteAndCreateFile(files, optionsFiles);
      }

      return objUpdated;
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePoint(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Point: DeleteResult = await this.PointRepository.softDelete(id);
      if (Point.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'point',
        entry_id: id,
        ip,
      });
      return Point;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getPointCalculationsAvailability(
    filters: PointFiltersDTO,
  ): Promise<PointCalculationsAvailabilityViewEntity[]> {
    const queryBuilder =
      this.pointCalculationsAvailabilityRepository.createQueryBuilder('pc');

    if (filters.country) {
      queryBuilder.andWhere('pc.country_pde = :country', {
        country: filters.country,
      });
    }

    if (filters.province) {
      queryBuilder.andWhere('pc.province_pde = :province', {
        province: filters.province,
      });
    }

    if (filters.canton) {
      queryBuilder.andWhere('pc.canton_pde = :canton', {
        canton: filters.canton,
      });
    }

    if (filters.parish) {
      queryBuilder.andWhere('pc.parish_pde = :parish', {
        parish: filters.parish,
      });
    }

    if (filters.name) {
      queryBuilder.andWhere('pc.name_pde = :name', { name: filters.name });
    }

    return queryBuilder.getMany();
  }

  public async getPointAvailability(
    filters: PointFiltersDTO,
  ): Promise<PointAvailabilityDTO[]> {
    const queryBuilder =
      this.pointAvailabilityRepository.createQueryBuilder('pc');

    if (filters.country) {
      queryBuilder.andWhere('pc.country_pde = :country', {
        country: filters.country,
      });
    }

    if (filters.province) {
      queryBuilder.andWhere('pc.province_pde = :province', {
        province: filters.province,
      });
    }

    if (filters.canton) {
      queryBuilder.andWhere('pc.canton_pde = :canton', {
        canton: filters.canton,
      });
    }

    if (filters.parish) {
      queryBuilder.andWhere('pc.parish_pde = :parish', {
        parish: filters.parish,
      });
    }

    if (filters.name) {
      queryBuilder.andWhere('pc.name_pde = :name', { name: filters.name });
    }

    const results = await queryBuilder.getMany();

    const transformedResults: PointAvailabilityDTO[] = results.map((item) => {
      // Calculate ti
      const ti = item.disconnection_incidents.reduce((totalTi, incident) => {
        if (incident && incident.solved_date instanceof Date) {
          console.log('Entro aqui');

          const timeDifferenceInSeconds =
            (incident.solved_date.getTime() - incident.created_at.getTime()) /
            1000;
          return totalTi + timeDifferenceInSeconds;
        }
        return totalTi; // Si incident es null o solved_date no es una fecha válida, se ignora en el cálculo
      }, 0);

      // Calculate other properties
      const tm =
        (item.tman || 0) +
        (item.tmov || 0) +
        (item.tfault || 0) +
        (item.tpen || 0);
      const tt =
        new Date().getMonth() === 1
          ? 672
          : new Date().getDate() === 30
          ? 720
          : 744; // Update this logic based on actual days in the month

      const d = (1 - (ti - tm) / tt) * 100;
      const fcs =
        d >= 99.3
          ? 1
          : d >= 98.7
          ? 0.98
          : d >= 92.3
          ? 0.92
          : d >= 74.2
          ? 74.2
          : 0;

      const value_to_pay = item.monthly_fee_pde - fcs;
      const discount_of_unavailability = item.monthly_fee_pde - value_to_pay;
      const sub_total_monthly_fee_pde = value_to_pay;

      return {
        ...item,
        ti,
        tm,
        tt,
        d,
        fcs,
        value_to_pay,
        discount_of_unavailability,
        sub_total_monthly_fee_pde,
      };
    });

    return transformedResults;
  }
}
