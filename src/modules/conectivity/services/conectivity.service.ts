import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConectivityEntity } from '../entities/conectivity.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  ConectivityDTO,
  ConectivityResultDTO,
  ConectivityUpdateDTO,
} from '../dto/conectivity.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { FileService } from 'src/modules/file/services/file.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FILE_ENTITY_NAMES, MODULES_NAMES } from 'src/constants/enums';
import { WorkOrderService } from 'src/modules/work-order/services/work-order.service';
import { SpeedService } from 'src/modules/nomencladores/workorders-connectivity/services/speed.service';
import { PointService } from 'src/modules/points/services/point.service';
import { Request } from 'express';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { TechnologyService } from 'src/modules/nomencladores/workorders-connectivity/services/technology.service';
import { SharingService } from 'src/modules/nomencladores/workorders-connectivity/services/sharing.service';
import { ServiceStatusService } from 'src/modules/nomencladores/workorders-connectivity/services/service-status.service';

@Injectable()
export class ConectivityService {
  constructor(
    @InjectRepository(ConectivityEntity)
    private readonly ConectivityRepository: Repository<ConectivityEntity>,

    private readonly PointService: PointService,
    private readonly SpeedService: SpeedService,
    private readonly TechnologyService: TechnologyService,
    private readonly SharingService: SharingService,
    private readonly ServiceStatusService: ServiceStatusService,
    private readonly WorkOrderService: WorkOrderService,
    private readonly fileServices: FileService,
    private readonly SecurityService: SecurityService,
  ) {}

  public async createConectivity(
    body: ConectivityDTO,
    user_id: string,
    ip: string,
  ): Promise<ConectivityEntity> {
    try {
      const createdConectivity = await this.ConectivityRepository.save(body);

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'conectivity',
        entry_id: createdConectivity.id,
        ip,
      });

      return createdConectivity;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addConectivityFiles(id: string, files: Express.Multer.File[]) {
    try {
      const Conectivity = await this.ConectivityRepository.findOneBy({ id });

      if (!Conectivity) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la conectividad ',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: MODULES_NAMES.CONECTIVITY,
        relationshipName: FILE_ENTITY_NAMES.CONECTIVITY,
        valueRelationship: Conectivity.id,
      };
      this.fileServices.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createConectivityFromWorkOrder(id: string) {
    try {
      const workOrder = await this.WorkOrderService.findWorkOrderById(id);


      if (!workOrder) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la orden de trabajo ',
        });
      }

    
      

      const objConectivity = new ConectivityEntity();

      objConectivity.availability = workOrder.availability;
      objConectivity.installationCost = workOrder.installationCost;
      objConectivity.monthlyValue = workOrder.monthlyValue;
      objConectivity.technology = workOrder.technology;
      objConectivity.sharing = workOrder.sharing;
      objConectivity.date = workOrder.date;
      objConectivity.workOrder = workOrder;
      objConectivity.point = workOrder.point;

      const speed = await this.SpeedService.createSpeed({
        name: `${workOrder.downloadLink}x${workOrder.uploadLink}`,
        download: workOrder.downloadLink,
        upFile: workOrder.uploadLink,
      });

      objConectivity.speed = speed;

      return await this.ConectivityRepository.save(objConectivity);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findConectivity(
    page: number,
    limit: number,
    req: Request,
  ): Promise<ConectivityResultDTO> {
    try {
      const queryBuilder =
        this.ConectivityRepository.createQueryBuilder('conectivity');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;

      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search' ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `conectivity.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      console.log(query_string);

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} conectivity.pilot ILIKE '%${
            req.query.search
          }%' OR  conectivity.petition ILIKE '%${req.query.search}%' OR point.name ILIKE  '%${req.query.search}%' OR technology.name ILIKE  '%${req.query.search}%' OR sharing.name ILIKE  '%${req.query.search}%' OR serviceStatus.name ILIKE  '%${req.query.search}%' OR speed.name ILIKE  '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.andWhere(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Conectivity, totalElements] = await queryBuilder
        .leftJoinAndSelect('conectivity.technology', 'technology')
        .leftJoinAndSelect('conectivity.sharing', 'sharing')
        .leftJoinAndSelect('conectivity.point', 'point')
        .leftJoinAndSelect('conectivity.serviceStatus', 'serviceStatus')
        .leftJoinAndSelect('conectivity.speed', 'speed')
        .leftJoinAndSelect('conectivity.files', 'files')

        .orderBy('conectivity.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Conectivity],
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
    key: keyof ConectivityDTO;
    value: any;
  }) {
    try {
      const Conectivity = await this.ConectivityRepository.createQueryBuilder(
        'conectivity',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('conectivity.technology', 'technology')
        .leftJoinAndSelect('conectivity.sharing', 'sharing')
        .leftJoinAndSelect('conectivity.point', 'point')
        .leftJoinAndSelect('conectivity.serviceStatus', 'serviceStatus')
        .leftJoinAndSelect('conectivity.speed', 'speed')
        .leftJoinAndSelect('conectivity.files', 'files')

        .getOne();

      const files = await this.fileServices.findByEntityId(
        Conectivity.id,
        FILE_ENTITY_NAMES.CONECTIVITY,
      );

      Conectivity.files = files;

      return Conectivity;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findConectivityById(id: string): Promise<ConectivityEntity> {
    try {
      const Conectivity: ConectivityEntity =
        await this.ConectivityRepository.createQueryBuilder('conectivity')
          .where({ id })
          .leftJoinAndSelect('conectivity.technology', 'technology')
          .leftJoinAndSelect('conectivity.sharing', 'sharing')
          .leftJoinAndSelect('conectivity.point', 'point')
          .leftJoinAndSelect('conectivity.serviceStatus', 'serviceStatus')
          .leftJoinAndSelect('conectivity.speed', 'speed')
          .leftJoinAndSelect('conectivity.files', 'files')

          .getOne();

      const files = await this.fileServices.findByEntityId(
        Conectivity.id,
        FILE_ENTITY_NAMES.CONECTIVITY,
      );

      Conectivity.files = files;

      return Conectivity;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateConectivity(
    id: string,
    body: ConectivityUpdateDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const ConectivityToUpdate = await this.ConectivityRepository.findOneBy({
        id,
      });

      if (!ConectivityToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la conectividad ',
        });
      }

      const Conectivity: Partial<ConectivityEntity> = {
        availability: body.availability,
        installationCost: body.installationCost,
        monthlyValue: body.monthlyValue,
        petition: body.petition,
        pilot: body.pilot,
      };

      if (body.technology?.id) {
        const obj = await this.TechnologyService.findTechnologyById(
          body.technology.id,
        );
        Conectivity.technology = obj
      }
      if (body.sharing?.id) {
        const obj = await this.SharingService.findSharingById(
          body.sharing.id,
        );
        Conectivity.sharing = obj
      }
      if (body.point?.id) {
        const obj = await this.PointService.findPointById(
          body.point.id,
        );
        Conectivity.point = obj
      }
      if (body.speed?.id) {
        const obj = await this.SpeedService.findSpeedById(
          body.speed.id,
        );
        Conectivity.speed = obj
      }
      if (body.serviceStatus?.id) {
        const obj = await this.ServiceStatusService.findServiceStatusById(
          body.serviceStatus.id,
        );
        Conectivity.serviceStatus = obj
      }

      const objUpdated = await this.ConectivityRepository.update(id, Conectivity);
      if (objUpdated.affected > 0 && files) {
        
        const options: FileOptionsDTO = {
          moduleName: MODULES_NAMES.CONECTIVITY,
          relationshipName: FILE_ENTITY_NAMES.CONECTIVITY,
          valueRelationship: id,
        };
        await this.fileServices.deleteAndCreateFile(files, options);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'conectivity',
        entry_id: ConectivityToUpdate.id,
        ip,
      });
      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteConectivity(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Conectivity: DeleteResult =
        await this.ConectivityRepository.softDelete(id);
      if (Conectivity.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'conectivity',
        entry_id: id,
        ip,
      });
      return Conectivity;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
