import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilitatorPlanningEntity } from '../entities/facilitator-planning.entity';
import { Between, DeleteResult, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';

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
import {
  FacilitatorPlanningDTO,
  FacilitatorPlanningResultDTO,
  FacilitatorPlanningUpdateDTO,
} from '../dto/facilitator-planning.dto';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { ROLES } from 'src/constants';
import { Request } from 'express';
import { ValidatePlanningDTO } from '../dto/planning.dto';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class FacilitatorPlanningService {
  constructor(
    @InjectRepository(FacilitatorPlanningEntity)
    private readonly planningRepository: Repository<FacilitatorPlanningEntity>,

    private readonly userService: UsersService,
    private readonly addressService: AddressService,
    private readonly equipmentService: EquipmentService,
    private readonly componentService: ComponentService,
    private readonly reportService: ReportService,
    private readonly EmployeeService: EmployeeService,
  ) {}

  public async createPlanning(
    body: FacilitatorPlanningDTO,
    user_id: string,
  ): Promise<FacilitatorPlanningEntity | null> {
    try {
      if (body.start_date) {
        if (new Date(body.start_date) < new Date()) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'La fecha de inicio no debe ser menor a la actual',
          });
        }
      }

      const employee = await this.EmployeeService.findEmployeeByUserId(user_id);

      const planning = new FacilitatorPlanningEntity();
      planning.start_date = body.start_date;
      planning.estimated_time = body.estimated_time;
      planning.observation = body.observation;
      planning.status = body.status;
      planning.employee = employee;
      planning.date = new Date(body.start_date);

      return await this.planningRepository.save(planning);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error?.message);
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

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      // let query: any = {...req.query}

      // delete query?.pageSize
      // delete query?.pageNo

      // if(query.start_date){
      //   query['date'] = MoreThanOrEqual(new Date(query?.start_date))
      //   delete query?.start_date
      // }

      const queryBuilder = this.planningRepository
        .createQueryBuilder('facilitator_planning')
        .leftJoin('facilitator_planning.employee', 'employee')
        .where('employee.id = :id', { id: employee.id })
        .andWhere('facilitator_planning.status != :status', {
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
        .orderBy('facilitator_planning.updatedAt', 'DESC')
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
  ): Promise<FacilitatorPlanningResultDTO> {
    try {
      const queryBuilder = this.planningRepository.createQueryBuilder(
        'facilitator_planning',
      );

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
              key.split('.').length > 1 ? key : `facilitator_planning.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${
            query_string ? ' AND ' : ''
          } facilitator_planning.observation ILIKE '%${req.query.search}%'`,
        );
      }

      if (employee?.user_type === ROLES.FACILITATOR) {
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
        .leftJoinAndSelect('facilitator_planning.employee', 'employee')
        .orderBy('facilitator_planning.updatedAt', 'DESC')
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

  public async findBy({
    key,
    value,
  }: {
    key: keyof FacilitatorPlanningDTO;
    value: any;
  }) {
    try {
      const Planning = await this.planningRepository
        .createQueryBuilder('facilitator_planning')
        .leftJoinAndSelect('facilitator_planning.employee', 'employee')
        .where({ [key]: value })
        .getOne();

      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPlanningById(
    id: string,
  ): Promise<FacilitatorPlanningEntity> {
    try {
      const Planning: FacilitatorPlanningEntity = await this.planningRepository
        .createQueryBuilder('facilitator_planning')
        .leftJoinAndSelect('facilitator_planning.employee', 'employee')

        .where({ id })
        .getOne();
      return Planning;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePlanning(
    id: string,
    body: FacilitatorPlanningUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const planningToUpdate = await this.planningRepository.findOne({
        where: { id },
      });

      if (!planningToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la curso',
        });
      }
      planningToUpdate.start_date = body.start_date;
      planningToUpdate.estimated_time = body.estimated_time;
      planningToUpdate.status = body.status;
      planningToUpdate.observation = body.observation;

      if (body.start_date) {
        planningToUpdate.date = new Date(body.start_date);
      }

      return await this.planningRepository.update(id, planningToUpdate);
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
