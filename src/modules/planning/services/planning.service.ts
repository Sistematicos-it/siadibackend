import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningEntity } from '../entities/planning.entity';
import { Between, DeleteResult, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import {
  PlanningDTO,
  PlanningResultDTO,
  PlanningUpdateDTO,
  SubordinatePlanningDTO,
  ValidatePlanningDTO,
} from '../dto/planning.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { EquipmentEntity } from 'src/modules/nomencladores/equipment/entities/equipment.entity';
import { ComponentEntity } from 'src/modules/nomencladores/component/entities/component.entity';
import { EquipmentService } from 'src/modules/nomencladores/equipment/services/equipment.service';
import { ComponentService } from 'src/modules/nomencladores/component/services/component.service';
import { ReportService } from 'src/modules/nomencladores/reports/services/report.service';
import { PointService } from 'src/modules/points/services/point.service';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ReportEntity } from 'src/modules/nomencladores/reports/entities/report.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { ROLES } from 'src/constants';
import { Request } from 'express';
import {
  endOfDay,
  lastDayOfWeek,
  parse,
  startOfDay,
  isSameDay,
  format,
} from 'date-fns';
import { IPlanningReport } from '../interfaces/planning.interface';
import { IncidentService } from 'src/modules/incident/services/incident.service';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(PlanningEntity)
    private readonly planningRepository: Repository<PlanningEntity>,
    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    private readonly userService: UsersService,
    private readonly addressService: AddressService,
    private readonly equipmentService: EquipmentService,
    private readonly componentService: ComponentService,
    private readonly reportService: ReportService,
    private readonly EmployeeService: EmployeeService,
    private readonly visitPointService: PointService,
    private readonly IncidentService: IncidentService,
  ) {}

  public async createPlanning(
    body: PlanningDTO,
    user_id: string,
  ): Promise<PlanningEntity | null> {
    try {
      const listEquipments: EquipmentEntity[] = [];
      const listComponents: ComponentEntity[] = [];
      const listIncidents: IncidentEntity[] = [];

      const objEmployee = await this.EmployeeService.findEmployeeByUserId(
        user_id,
      );
      let objSourceAddress: AddressEntity = null;
      if (body.sourceAddress)
        objSourceAddress = await this.addressService.findAddressById(
          body.sourceAddress,
        );

      let objDestinationAddress: AddressEntity = null;
      if (body.destinationAddress)
        objDestinationAddress = await this.addressService.findAddressById(
          body.destinationAddress,
        );

      let objReport: ReportEntity = null;
      if (body.reports) await this.reportService.findReportById(body.reports);

      let objVisitPoint: PointEntity = null;
      if (body.visitPoint)
        objVisitPoint = await this.visitPointService.findPointById(
          body.visitPoint,
        );

      if (body?.equipments?.length > 0) {
        for (const iterator of body.equipments) {
          const objEquipment = await this.equipmentService.findEquipmentById(
            iterator.id,
          );
          if (objEquipment) {
            listEquipments.push(objEquipment);
          }
        }
      }

      if (body?.components?.length > 0) {
        for (const iterator of body.components) {
          const objComponents = await this.componentService.findComponentById(
            iterator.id,
          );
          if (objComponents) {
            listComponents.push(objComponents);
          }
        }
      }

      if (body?.incidents?.length > 0) {
        for (const iterator of body.incidents) {
          const objIncidents = await this.IncidentService.findIncidentById(
            iterator.id,
          );
          if (objIncidents) {
            listIncidents.push(objIncidents);
          }
        }
      }

      if (body.start_date) {
        if (new Date(body.start_date) < new Date()) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'La fecha de inicio no debe ser menor a la actual',
          });
        }
      }
      const planning = new PlanningEntity();
      planning.activity = body.activity;
      planning.start_date = body.start_date;
      planning.estimated_time = body.estimated_time;
      planning.status = body.status;
      planning.observation = body.observation;
      planning.reports = objReport;
      planning.visitPoint = objVisitPoint;
      planning.employee = objEmployee;
      planning.applyPerDiem = body.applyPerDiem;
      planning.sourceAddress = objSourceAddress;
      planning.destinationAddress = objDestinationAddress;

      planning.equipments = listEquipments;
      planning.components = listComponents;
      planning.incidents = listIncidents;
      planning.date = new Date(body.start_date);

      return await this.planningRepository.save(planning);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error?.message);
    }
  }

  public async findSubordinatesPlanning(user_id: string) {
    try {
      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const subordinates = employee.subordinates;

      let plannings: SubordinatePlanningDTO[] = [];

      subordinates?.forEach(async (sub) => {
        const plann = await this.planningRepository
          .createQueryBuilder('planning')
          .leftJoinAndSelect('planning.sourceAddress', 'sourceAddress')
          .leftJoinAndSelect('planning.visitPoint', 'visitPoint')
          .leftJoinAndSelect(
            'planning.destinationAddress',
            'destinationAddress',
          )
          .leftJoinAndSelect('planning.reports', 'reports')
          .leftJoinAndSelect('planning.equipments', 'equipments')
          .leftJoinAndSelect('planning.components', 'components')
          .leftJoinAndSelect('planning.incidents', 'incidents')
          .leftJoinAndSelect('planning.employee', 'employee')

          .where('employee.id = :id', { id: sub.id })
          .andWhere('planning.status != :status', {
            status: STATUS_IN_PLANNING.DRAFT,
          })
          .getMany();

        plannings.push({ employee: sub, plannings: plann });
      });

      return { data: plannings };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOneSubordinatePlanning(
    page: number,
    limit: number,
    id: string,
    req?: Request,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el empleado',
        });
      }

      // let query: any = {...req.query}

      // delete query?.pageSize
      // delete query?.pageNo

      // if(query.start_date){
      //   query['date'] = MoreThanOrEqual(new Date(query?.start_date))
      //   delete query?.start_date
      // }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const queryBuilder = this.planningRepository
        .createQueryBuilder('planning')
        .leftJoinAndSelect('planning.sourceAddress', 'sourceAddress')
        .leftJoinAndSelect('planning.destinationAddress', 'destinationAddress')
        .leftJoinAndSelect('planning.reports', 'reports')
        .leftJoinAndSelect('planning.equipments', 'equipments')
        .leftJoinAndSelect('planning.components', 'components')
        .leftJoinAndSelect('planning.visitPoint', 'visitPoint')
        .leftJoinAndSelect('planning.incidents', 'incidents')
        .leftJoin('planning.employee', 'employee')
        .where('employee.id = :id', { id: employee.id })
        .andWhere('planning.status != :status', {
          status: STATUS_IN_PLANNING.DRAFT,
        });

      if (req?.query?.start_date) {
        const date = new Date(String(req?.query?.start_date));

        queryBuilder.andWhere({
          date: Between(startOfDay(date), endOfDay(date)),
        });
      }

      if (req?.query?.estimated_time) {
        queryBuilder.andWhere({ estimated_time: req?.query?.estimated_time });
      }

      if (req?.query?.status) {
        queryBuilder.andWhere({ status: req?.query?.status });
      }

      const [plann, totalElements] = await queryBuilder
        .orderBy('planning.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...plann],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPlanning(
    page: number,
    limit: number,
    req: Request,
    user_id: string,
  ): Promise<PlanningResultDTO> {
    try {
      const queryBuilder =
        this.planningRepository.createQueryBuilder('planning');

      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `planning.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} planning.observation ILIKE '%${
            req.query.search
          }%' OR  planning.estimated_time ILIKE '%${req.query.search}%'`,
        );
      }

      if (employee?.user_type === ROLES.TECHNICAL_ASSISTENT) {
        queryBuilder.where('employee.id = :id', { id: employee?.id });

        if (query_string) {
          queryBuilder.andWhere(query_string);
        }
      } else {
        if (query_string) {
          queryBuilder.where(query_string);
        }
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [planning, totalElements] = await queryBuilder
        .leftJoinAndSelect('planning.sourceAddress', 'sourceAddress')
        .leftJoinAndSelect('planning.destinationAddress', 'destinationAddress')
        .leftJoinAndSelect('planning.reports', 'reports')
        .leftJoinAndSelect('planning.equipments', 'equipments')
        .leftJoinAndSelect('planning.components', 'components')
        .leftJoinAndSelect('planning.incidents', 'incidents')
        .leftJoinAndSelect('planning.visitPoint', 'visitPoint')
        .leftJoinAndSelect('planning.employee', 'employee')
        .orderBy('planning.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...planning],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof PlanningDTO; value: any }) {
    try {
      const Planning = await this.planningRepository
        .createQueryBuilder('planning')
        .leftJoinAndSelect('planning.employee', 'employee')
        .where({ [key]: value })
        .getOne();

      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPlanningById(id: string): Promise<PlanningEntity> {
    try {
      const Planning: PlanningEntity = await this.planningRepository
        .createQueryBuilder('planning')
        .leftJoinAndSelect('planning.sourceAddress', 'sourceAddress')
        .leftJoinAndSelect('planning.destinationAddress', 'destinationAddress')
        .leftJoinAndSelect('planning.reports', 'reports')
        .leftJoinAndSelect('planning.equipments', 'equipments')
        .leftJoinAndSelect('planning.components', 'components')
        .leftJoinAndSelect('planning.incidents', 'incidents')
        .leftJoinAndSelect('planning.visitPoint', 'visitPoint')
        .leftJoinAndSelect('planning.employee', 'employee')
        .where({ id })
        .getOne();
      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updatePlanning(
    id: string,
    body: PlanningUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const {
        visitPoint,
        sourceAddress,
        destinationAddress,
        reports,
        equipments,
        components,
        incidents,
        ...updateData
      } = body;

      let objSourceAddress: AddressEntity = null;
      if (sourceAddress)
        objSourceAddress = await this.addressService.findAddressById(
          sourceAddress,
        );

      let objDestinationAddress: AddressEntity = null;
      if (destinationAddress)
        objDestinationAddress = await this.addressService.findAddressById(
          destinationAddress,
        );

      let objReport: ReportEntity = null;
      if (reports)objReport = await this.reportService.findReportById(reports);

      let objVisitPoint: PointEntity = null;
      if (visitPoint)
        objVisitPoint = await this.visitPointService.findPointById(visitPoint);

      const updateResult = await this.planningRepository.update(id, updateData);

      if (updateResult.affected === 0) {
        throw new Error('No se pudo encontrar el planning');
      }

      const planningToUpdate = await this.planningRepository.findOne({
        where: { id: id },
      });

      planningToUpdate.applyPerDiem = body.applyPerDiem;
      planningToUpdate.visitPoint = objVisitPoint;
      planningToUpdate.sourceAddress = objSourceAddress;
      planningToUpdate.destinationAddress = objDestinationAddress;
      planningToUpdate.reports = objReport;
      planningToUpdate.equipments =
        await this.equipmentService.findEquipmentByIds(equipments);
      planningToUpdate.components =
        await this.componentService.findComponentByIds(components);

      planningToUpdate.incidents =
        await this.IncidentService.findIncidentsByIds(incidents);
      if (body.start_date) {
        planningToUpdate.date = new Date(body.start_date);
      }

      await this.planningRepository.save(planningToUpdate);

      return updateResult;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async validateManySubordinatesPlanning(body: ValidatePlanningDTO) {
    try {
      for (let i = 0; i < body.id.length; i++) {
        const validated = await this.ValidateSubordinatePlanning(
          body.id[i],
          body.status,
        );
      }

      return { data: 'Se validaron las planificaciones exitosamente' };
    } catch (error) {
      console.log(error);
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  public async ValidateSubordinatePlanning(
    id: string,
    status: STATUS_IN_PLANNING,
  ) {
    try {
      const planning = await this.planningRepository.findOne({ where: { id } });

      if (!planning) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la planificacion',
        });
      }
      if (
        planning.status !== STATUS_IN_PLANNING.EJECUTED &&
        planning.status !== STATUS_IN_PLANNING.NO_EXECUTED
      ) {
        return null;
      }
      return await this.planningRepository.update(planning.id, {
        status: status,
      });
    } catch (error) {
      console.log(error);
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  public async getEmployeeWeekPlanning(
    id: string,
    start_date: string,
    end_date: string,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);
      const point = await this.PointRepository.findOne({
        where: { technical_asistent_employee: { id: employee.id } },
        relations: {
          technical_asistent_employee: true,
          facilitator_employee: true,
          address: { parish: { canton: { parishes: true } } },
        },
      });

      const _start_date = new Date(start_date);
      const _end_date = new Date(end_date);

      const planning = await this.planningRepository.find({
        where: {
          date: Between(startOfDay(_start_date), endOfDay(_end_date)),
          employee: { id: employee.id },
        },
        relations: {
          employee: true,
          sourceAddress: true,
          visitPoint: {
            facilitator_employee: true,
            technical_asistent_employee: true,
          },
          destinationAddress: true,
          reports: true,
          equipments: true,
          components: true,
        },
      });

      planning.sort((a, b) => {
        const nameA = new Date(a.start_date);
        const nameB = new Date(b.start_date);
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

      let date_organized_plannings: IPlanningReport[] = [];

      let planning_dates: Date[] = [];

      planning.forEach((plann) => {
        const date = new Date(plann.date);

        if (
          !planning_dates.find(
            (pDate) =>
              format(pDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
          )
        ) {
          planning_dates.push(date);
        }
      });

      planning_dates.forEach((date) => {
        let report: IPlanningReport = {
          start_date: format(date, 'yyyy-MM-dd'),
          plannings: [],
        };

        planning.forEach((_planning) => {
          if (
            format(new Date(_planning.date), 'yyyy-MM-dd') === report.start_date
          ) {
            report.plannings.push(_planning);
          }
        });

        date_organized_plannings.push(report);
      });

      return { planning_array: date_organized_plannings, point: point };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePlanning(id: string): Promise<DeleteResult | undefined> {
    try {
      const Planning: DeleteResult = await this.planningRepository.softDelete(
        id,
      );
      if (Planning.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
