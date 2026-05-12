import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportConnectionLogsEntity } from '../entities/report-connection-logs.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  ReportConnectionLogsDTO,
  ReportConnectionLogsResultDTO,
  ReportConnectionLogsUpdateDTO,
} from '../dto/report-connection-logs.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { Request } from 'express';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { MODULES_NAMES } from 'src/constants/enums';
import { FileService } from 'src/modules/file/services/file.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { PointService } from 'src/modules/points/services/point.service';

@Injectable()
export class ReportConnectionLogsService {
  constructor(
    @InjectRepository(ReportConnectionLogsEntity)
    private readonly reportConnectionLogsRepository: Repository<ReportConnectionLogsEntity>,
    private readonly userService: UsersService,
    private readonly pdeService: PointService,
  ) {}

  public async createReportConnectionLogs(idUser: string, body: ReportConnectionLogsDTO): Promise<ReportConnectionLogsEntity> {
    try {
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

      const objConnectionLogs = new ReportConnectionLogsEntity();
      objConnectionLogs.point = objPoint ? objPoint : null;

      objConnectionLogs.code_pde = objPoint ? objPoint.code : null;
      objConnectionLogs.name_pde = objPoint ? objPoint.observations : null;
      
      objConnectionLogs.country_pde = objPoint ? objPoint.country : null;
      objConnectionLogs.region_pde = objPoint ? objPoint.region : null;
      objConnectionLogs.province_pde = objPoint ? objPoint.province : null;
      objConnectionLogs.canton_pde = objPoint ? objPoint.canton : null;
      objConnectionLogs.parish_pde = objPoint ? objPoint.parish : null;

      objConnectionLogs.type = body.type;
      objConnectionLogs.connectivity = body.connectivity;

      objConnectionLogs.tman = body.tman;
      objConnectionLogs.tmov = body.tmov;
      objConnectionLogs.tfault = body.tfault;
      objConnectionLogs.tpen = body.tpen; 
      
      objConnectionLogs.ti = body.ti;
      objConnectionLogs.fcs = body.fcs;
      objConnectionLogs.tm = body.tm;
      objConnectionLogs.tt = body.tt; 

      objConnectionLogs.monthlyFee_pde = body.monthlyFee_pde;
      objConnectionLogs.valueToPay = body.valueToPay;
      objConnectionLogs.discountOfUnavailability = body.discountOfUnavailability;
      objConnectionLogs.subTotalMonthlyFee_pde = body.subTotalMonthlyFee_pde; 

      const conecctions = await this.reportConnectionLogsRepository.save(objConnectionLogs);
      return conecctions
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateReportConnectionLogs(
    id: string,
    idUser: string,
    body: ReportConnectionLogsUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ReportConnectionLogsToUpdate = await this.reportConnectionLogsRepository.findOneBy({
        id,
      });

      if (!ReportConnectionLogsToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }
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

      const updateData: Partial<ReportConnectionLogsEntity> = {
        point: objPoint ? objPoint : null,

        code_pde: objPoint ? objPoint.code : null,
        name_pde: objPoint ? objPoint.observations : null,
        
        country_pde: objPoint ? objPoint.country : null,
        region_pde: objPoint ? objPoint.region : null,
        province_pde: objPoint ? objPoint.province : null,
        canton_pde: objPoint ? objPoint.canton : null,
        parish_pde: objPoint ? objPoint.parish : null,

        type: body.type,
        connectivity: body.connectivity,

        tman: body.tman,
        tmov: body.tmov,
        tfault: body.tfault,
        tpen: body.tpen, 
        
        ti: body.ti,
        fcs: body.fcs,
        tm: body.tm,
        tt: body.tt,

        monthlyFee_pde: body.monthlyFee_pde,
        valueToPay: body.valueToPay,
        discountOfUnavailability: body.discountOfUnavailability,
        subTotalMonthlyFee_pde: body.subTotalMonthlyFee_pde, 
      };
      return await this.reportConnectionLogsRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReportConnectionLogs(
    page: number,
    limit: number,
    req: Request,
  ): Promise<ReportConnectionLogsResultDTO> {
    try {
      const queryBuilder =
        this.reportConnectionLogsRepository.createQueryBuilder('reportConnectionLogs');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `reportConnectionLogs.${key}`}='${values[i]}'`,
          );
          realIndex++
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} reportConnectionLogs.name ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [ConnectionLogs, totalElements] = await queryBuilder
        .leftJoinAndSelect('reportConnectionLogs.point', 'point')
        .orderBy('reportConnectionLogs.updatedAt', 'DESC')
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

  public async findBy({ key, value }: { key: keyof ReportConnectionLogsDTO; value: any }) {
    try {
      const ConnectionLogs = await this.reportConnectionLogsRepository
        .createQueryBuilder('reportConnectionLogs')
        .where({ [key]: value })
        .getOne();

      return ConnectionLogs;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReportConnectionLogsById(id: string): Promise<ReportConnectionLogsEntity> {
    try {
      const ConnectionLogs: ReportConnectionLogsEntity = await this.reportConnectionLogsRepository
        .createQueryBuilder('reportConnectionLogs')
        .where({ id })
        .getOne();
      return ConnectionLogs;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findReportConnectionLogsByIds(ids: string[]): Promise<ReportConnectionLogsEntity[]> {
    try {
      return await this.reportConnectionLogsRepository.findBy({ id: In(ids) });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteReportConnectionLogs(id: string): Promise<DeleteResult | undefined> {
    try {
      const ConnectionLogs: DeleteResult = await this.reportConnectionLogsRepository.softDelete(
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
