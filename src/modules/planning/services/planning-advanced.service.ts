import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningAdvancedEntity } from '../entities/planning-advanced.entity';
import { Between, DeleteResult, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import {
  PlanningAdvancedDTO,
  PlanningAdvancedResultDTO,
  PlanningAdvancedUpdateDTO,
  SubordinatePlanningAdvancedDTO,
} from '../dto/planning-advanced.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { UsersService } from 'src/modules/users/services/users.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { EquipmentEntity } from 'src/modules/nomencladores/equipment/entities/equipment.entity';
import { ComponentEntity } from 'src/modules/nomencladores/component/entities/component.entity';
import { EquipmentService } from 'src/modules/nomencladores/equipment/services/equipment.service';
import { ComponentService } from 'src/modules/nomencladores/component/services/component.service';
import { ReportService } from 'src/modules/nomencladores/reports/services/report.service';
import { PointService } from 'src/modules/points/services/point.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { ROLES } from 'src/constants';
import { Request } from 'express';
import { ValidatePlanningDTO } from '../dto/planning.dto';
import { endOfDay, format, lastDayOfWeek, startOfDay } from 'date-fns';
import { IPlanningAdvancedReport } from '../interfaces/planning-advanced.interface';
import { IPlanningReport } from '../interfaces/planning.interface';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';
import { IncidentService } from 'src/modules/incident/services/incident.service';

@Injectable()
export class PlanningAdvancedService {
  constructor(
    @InjectRepository(PlanningAdvancedEntity)
    private readonly planningAdvancedRepository: Repository<PlanningAdvancedEntity>,

    private readonly pointService: PointService,
    private readonly addressService: AddressService,
    private readonly equipmentService: EquipmentService,
    private readonly componentService: ComponentService,
    private readonly reportService: ReportService,
    private readonly EmployeeService: EmployeeService,
    private readonly IncidentService: IncidentService,
  ) {}

  public async createPlanningAdvanced(
    body: PlanningAdvancedDTO,
    user_id: string,
  ): Promise<PlanningAdvancedEntity | null> {
    try {
      const listIncidents: IncidentEntity[] = [];
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

      let objVisitPoint: PointEntity = null;
      if (body.visitPoint)
        objVisitPoint = await this.pointService.findPointById(body.visitPoint);

      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

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

      const planningAdvanced = new PlanningAdvancedEntity();
      planningAdvanced.activity = body.activity;
      planningAdvanced.start_date = body.start_date;
      planningAdvanced.estimated_time = body.estimated_time;
      planningAdvanced.status = body.status;
      planningAdvanced.observation = body.observation;
      planningAdvanced.visitReasonOfVisit = body.visitReasonOfVisit;
      planningAdvanced.applyPerDiem = body.applyPerDiem;
      planningAdvanced.visitActivityType = body.visitActivityType;
      planningAdvanced.employee = employee;
      planningAdvanced.visitPoint = objVisitPoint;
      planningAdvanced.sourceAddress = objSourceAddress;
      planningAdvanced.destinationAddress = objDestinationAddress;

      planningAdvanced.date = new Date(body.start_date);

      return await this.planningAdvancedRepository.save(planningAdvanced);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error?.message);
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
      const planning = await this.planningAdvancedRepository.findOne({
        where: { id },
      });

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

      return await this.planningAdvancedRepository.update(planning.id, {
        status: status,
      });
    } catch (error) {
      console.log(error);
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSubordinatesPlanningAdvanced(user_id: string) {
    try {
      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const subordinates = employee.subordinates;

      let plannings: SubordinatePlanningAdvancedDTO[] = [];

      subordinates?.forEach(async (sub) => {
        const plann = await this.planningAdvancedRepository
          .createQueryBuilder('planningAdvanced')
          .leftJoin('planningAdvanced.employee', 'employee')
          .leftJoinAndSelect('planningAdvanced.sourceAddress', 'sourceAddress')
          .leftJoinAndSelect(
            'planningAdvanced.destinationAddress',
            'destinationAddress',
          )
          .leftJoinAndSelect('planningAdvanced.visitPoint', 'visitPoint')
          
          .where('employee.id = :id', { id: sub.id })
          .andWhere('planningAdvanced.status != :status', {
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
    req?: Request
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);

      if (!employee) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro el empleado',
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;


      // let query: any = {...req.query}

      // delete query?.pageSize
      // delete query?.pageNo

      // if(query.start_date){
      //   query['date'] = MoreThanOrEqual(new Date(query?.start_date))
      //   delete query?.start_date
      // }

      const queryBuilder = this.planningAdvancedRepository
      .createQueryBuilder('planningAdvanced')
      .leftJoinAndSelect('planningAdvanced.employee', 'employee')
      .leftJoinAndSelect('planningAdvanced.visitPoint', 'visitPoint')
      .leftJoinAndSelect('planningAdvanced.sourceAddress', 'sourceAddress')
      
      .where('employee.id = :id', { id: employee.id })
      .andWhere('planningAdvanced.status != :status', {
        status: STATUS_IN_PLANNING.DRAFT,
      })


      if(req?.query?.start_date){
        const date = new Date(String(req?.query?.start_date))

        queryBuilder.andWhere({date: Between(startOfDay(date), endOfDay(date))})

      }

      if(req?.query?.estimated_time){
        queryBuilder.andWhere({estimated_time: req?.query?.estimated_time})
      }

      if(req?.query?.status){
        queryBuilder.andWhere({status: req?.query?.status})
      }


      const [plann, totalElements] = await queryBuilder
        .orderBy('planningAdvanced.updatedAt', 'DESC')
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

  public async findPlanningAdvanced(
    page: number,
    limit: number,
    req: Request,
    user_id: string,
  ): Promise<PlanningAdvancedResultDTO> {
    try {
      const queryBuilder =
        this.planningAdvancedRepository.createQueryBuilder('planningAdvanced');

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
              key.split('.').length > 1 ? key : `planningAdvanced.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} planningAdvanced.observation ILIKE '%${
            req.query.search
          }%' OR  planningAdvanced.visitReasonOfVisit ILIKE '%${
            req.query.search
          }%'`,
        );
      }

      if (employee?.user_type === ROLES.MANAGER) {
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
      const [planningAdvanced, totalElements] = await queryBuilder
        .leftJoinAndSelect('planningAdvanced.employee', 'employee')
        .leftJoinAndSelect('planningAdvanced.visitPoint', 'visitPoint')
        .leftJoinAndSelect('planningAdvanced.sourceAddress', 'sourceAddress')
        
        .orderBy('planningAdvanced.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...planningAdvanced],
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
    key: keyof PlanningAdvancedDTO;
    value: any;
  }) {
    try {
      const Planning = await this.planningAdvancedRepository
        .createQueryBuilder('planningAdvanced')
        .leftJoinAndSelect('planningAdvanced.employee', 'employee')
        .leftJoinAndSelect('planningAdvanced.visitPoint', 'visitPoint')
        .leftJoinAndSelect('planningAdvanced.sourceAddress', 'sourceAddress')
        
        .leftJoinAndSelect(
          'planningAdvanced.destinationAddress',
          'destinationAddress',
        )
        .where({ [key]: value })
        .getOne();

      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPlanningAdvancedById(
    id: string,
  ): Promise<PlanningAdvancedEntity> {
    try {
      const Planning: PlanningAdvancedEntity =
        await this.planningAdvancedRepository
          .createQueryBuilder('planningAdvanced')
          .leftJoinAndSelect('planningAdvanced.employee', 'employee')
          .leftJoinAndSelect('planningAdvanced.visitPoint', 'visitPoint')
          .leftJoinAndSelect('planningAdvanced.sourceAddress', 'sourceAddress')
          
          .leftJoinAndSelect(
            'planningAdvanced.destinationAddress',
            'destinationAddress',
          )
          .where({ id })
          .getOne();
      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getEmployeeWeekPlanning(
    id: string,
    start_date: string,
    end_date: string,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);

      const _start_date = new Date(start_date);
      const _end_date = new Date(end_date);

      const planning = await this.planningAdvancedRepository.find({
        where: {
          date: Between(startOfDay(_start_date), endOfDay(_end_date)),
          employee: { id: employee.id },
        },
        relations: {
          employee: true,
          sourceAddress: true,
          visitPoint: { facilitator_employee: true },
          destinationAddress: true,
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

      let date_organized_plannings: IPlanningAdvancedReport[] = [];

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
        let report: IPlanningAdvancedReport = {
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

      return { planning_array: date_organized_plannings };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePlanningAdvanced(
    id: string,
    body: PlanningAdvancedUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const planningAdvancedToUpdate =
        await this.planningAdvancedRepository.findOne({
          where: { id },
        });

      if (!planningAdvancedToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la curso',
        });
      }
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

      let objVisitPoint: PointEntity = null;
      if (body.visitPoint)
        objVisitPoint = await this.pointService.findPointById(body.visitPoint);

      
      planningAdvancedToUpdate.activity = body.activity;
      planningAdvancedToUpdate.start_date = body.start_date;
      planningAdvancedToUpdate.estimated_time = body.estimated_time;
      planningAdvancedToUpdate.status = body.status;
      planningAdvancedToUpdate.observation = body.observation;
      planningAdvancedToUpdate.visitReasonOfVisit = body.visitReasonOfVisit;
      planningAdvancedToUpdate.applyPerDiem = body.applyPerDiem;
      planningAdvancedToUpdate.visitActivityType = body.visitActivityType;
      planningAdvancedToUpdate.visitPoint = objVisitPoint;
      planningAdvancedToUpdate.sourceAddress = objSourceAddress;
      planningAdvancedToUpdate.destinationAddress = objDestinationAddress;

      if (body.start_date) {
        planningAdvancedToUpdate.date = new Date(body.start_date);
      }

      return await this.planningAdvancedRepository.update(
        id,
        planningAdvancedToUpdate,
      );
    } catch (error) {
      console.log(error);
      console.log(error)
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deletePlanningAdvanced(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Planning: DeleteResult =
        await this.planningAdvancedRepository.softDelete(id);
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
