import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkOrderEntity } from '../entities/work-order.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  WorkOrderDTO,
  WorkOrderResultDTO,
  WorkOrderUpdateDTO,
} from '../dto/work-order.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { BeneficiaryService } from 'src/modules/beneficiary/services/beneficiary.service';
import { TechnologyService } from 'src/modules/nomencladores/workorders-connectivity/services/technology.service';
import { SharingService } from 'src/modules/nomencladores/workorders-connectivity/services/sharing.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FILE_ENTITY_NAMES, MODULES_NAMES } from 'src/constants/enums';
import { FileService } from 'src/modules/file/services/file.service';
import { PointService } from 'src/modules/points/services/point.service';
import { Request } from 'express';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectRepository(WorkOrderEntity)
    private readonly workOrderRepository: Repository<WorkOrderEntity>,

    private readonly addressService: AddressService,
    private readonly employeeService: EmployeeService,
    private readonly beneficiaryService: BeneficiaryService,
    private readonly technologyService: TechnologyService,
    private readonly sharingService: SharingService,
    private readonly PointService: PointService,
    private readonly fileServices: FileService,
    private readonly SecurityService: SecurityService,
  ) {}

  public async createWorkOrder(
    body: WorkOrderDTO,
    files: Express.Multer.File[],
    user_id: string,
    ip: string,
  ): Promise<WorkOrderEntity> {
    try {
      const objAddress = await this.addressService.findAddressById(
        body.address,
      );

      const objBeneficiary = await this.beneficiaryService.findBeneficiaryById(
        body.beneficiary,
      );
      const objZoneCoordinator = await this.employeeService.findEmployeeById(
        body.zoneCoordinator,
      );
      const objApplicant = await this.employeeService.findEmployeeById(
        body.applicant,
      );
      const objAuthorizer = await this.employeeService.findEmployeeById(
        body.authorizer,
      );

      const objTechnology = await this.technologyService.findTechnologyById(
        body.technology,
      );
      const objSharing = await this.sharingService.findSharingById(
        body.sharing,
      );

      const objPoint = await this.PointService.findPointById(body.point_id);

      const objToCreate = new WorkOrderEntity();
      objToCreate.orderNumber = body.orderNumber;
      objToCreate.date = body.date;
      objToCreate.downloadLink = body.downloadLink;
      objToCreate.uploadLink = body.uploadLink;
      objToCreate.availability = body.availability;
      objToCreate.installationCost = body.installationCost;
      objToCreate.monthlyValue = body.monthlyValue;
      objToCreate.point = objPoint;
      objToCreate.address = objAddress;
      objToCreate.beneficiary = objBeneficiary;
      objToCreate.zoneCoordinator = objZoneCoordinator;
      objToCreate.applicant = objApplicant;
      objToCreate.authorizer = objAuthorizer;
      objToCreate.description = body.description;
      objToCreate.technology = objTechnology;
      objToCreate.sharing = objSharing;

      const objCreated = await this.workOrderRepository.save(objToCreate);

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.WORKORDER,
          relationshipName: 'workOrder',
          valueRelationship: objCreated.id,
        };
        this.fileServices.createFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'workOrder',
        entry_id: objCreated.id,
        ip,
      });

      return objCreated;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async addFiles(id: string, files: Express.Multer.File[]) {
    try {
      const workOrder = await this.workOrderRepository.findOneBy({ id });

      if (!workOrder) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el workOrder',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: MODULES_NAMES.WORKORDER,
        relationshipName: 'workOrder',
        valueRelationship: workOrder.id,
      };
      this.fileServices.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findWorkOrder(
    page: number,
    limit: number,
    req: Request,
  ): Promise<WorkOrderResultDTO> {
    try {
      const queryBuilder =
        this.workOrderRepository.createQueryBuilder('workOrder');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `workOrder.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} workOrder.orderNumber ILIKE '%${
            req.query.search
          }%' OR  point.name ILIKE '%${req.query.search}%' OR  workOrder.description ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.andWhere(query_string);
      }

      console.log(query_string)
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [WorkOrder, totalElements] = await queryBuilder
        .leftJoinAndSelect('workOrder.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .leftJoinAndSelect('workOrder.point', 'point')
        .orderBy('workOrder.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...WorkOrder],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof WorkOrderDTO; value: any }) {
    try {
      const WorkOrder = await this.workOrderRepository
        .createQueryBuilder('workOrder')
        .leftJoinAndSelect('workOrder.address', 'address')
        .leftJoinAndSelect('workOrder.beneficiary', 'beneficiary')
        .leftJoinAndSelect('workOrder.zoneCoordinator', 'zoneCoordinator')
        .leftJoinAndSelect('workOrder.applicant', 'applicant')
        .leftJoinAndSelect('workOrder.authorizer', 'authorizer')
        .leftJoinAndSelect('workOrder.technology', 'technology')
        .leftJoinAndSelect('workOrder.sharing', 'sharing')
        .leftJoinAndSelect('workOrder.point', 'point')
        .where({ [key]: value })
        .getOne();

      const files = await this.fileServices.findByEntityId(
        WorkOrder.id,
        FILE_ENTITY_NAMES.WORKORDER,
      );

      WorkOrder.files = files;

      return WorkOrder;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findWorkOrderById(id: string): Promise<WorkOrderEntity> {
    try {
      const WorkOrder: WorkOrderEntity = await this.workOrderRepository
        .createQueryBuilder('workOrder')
        .leftJoinAndSelect('workOrder.address', 'address')
        .leftJoinAndSelect('workOrder.beneficiary', 'beneficiary')
        .leftJoinAndSelect('workOrder.zoneCoordinator', 'zoneCoordinator')
        .leftJoinAndSelect('workOrder.applicant', 'applicant')
        .leftJoinAndSelect('workOrder.authorizer', 'authorizer')
        .leftJoinAndSelect('workOrder.technology', 'technology')
        .leftJoinAndSelect('workOrder.sharing', 'sharing')
        .leftJoinAndSelect('workOrder.point', 'point')
        .where({ id })
        .getOne();

      const files = await this.fileServices.findByEntityId(
        WorkOrder.id,
        FILE_ENTITY_NAMES.WORKORDER,
      );

      WorkOrder.files = files;
      return WorkOrder;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateWorkOrder(
    id: string,
    body: WorkOrderUpdateDTO,
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const workOrder = await this.workOrderRepository.findOneBy({
        id,
      });

      console.log(workOrder);
      if (!workOrder) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }

      const workOrderToUpdate: Partial<WorkOrderEntity> = {};
      if (body.orderNumber) workOrderToUpdate.orderNumber = body.orderNumber;
      if (body.date) workOrderToUpdate.date = body.date;
      if (body.downloadLink) workOrderToUpdate.downloadLink = body.downloadLink;
      if (body.uploadLink) workOrderToUpdate.uploadLink = body.uploadLink;
      if (body.availability) workOrderToUpdate.availability = body.availability;
      if (body.installationCost)
        workOrderToUpdate.installationCost = body.installationCost;
      if (body.monthlyValue) workOrderToUpdate.monthlyValue = body.monthlyValue;

      if (body.address) {
        const objAddress = await this.addressService.findAddressById(
          body.address,
        );
        workOrderToUpdate.address = objAddress;
      }
      if (body.beneficiary) {
        const objBeneficiary =
          await this.beneficiaryService.findBeneficiaryById(body.beneficiary);
        workOrderToUpdate.beneficiary = objBeneficiary;
      }
      if (body.zoneCoordinator) {
        const objZoneCoordinator = await this.employeeService.findEmployeeById(
          body.zoneCoordinator,
        );
        workOrderToUpdate.zoneCoordinator = objZoneCoordinator;
      }

      if (body.applicant) {
        const objApplicant = await this.employeeService.findEmployeeById(
          body.applicant,
        );
        workOrderToUpdate.applicant = objApplicant;
      }

      if (body.authorizer) {
        const objAuthorizer = await this.employeeService.findEmployeeById(
          body.authorizer,
        );
        workOrderToUpdate.authorizer = objAuthorizer;
      }
      if (body.technology) {
        const objTechnology = await this.technologyService.findTechnologyById(
          body.technology,
        );
        workOrderToUpdate.technology = objTechnology;
      }

      if (body.sharing) {
        const objSharing = await this.sharingService.findSharingById(
          body.sharing,
        );
        workOrderToUpdate.sharing = objSharing;
      }

      if (body.point_id) {
        const objPoint = await this.PointService.findPointById(body.point_id);

        workOrderToUpdate.point = objPoint;
      }

      workOrderToUpdate.description = body.description;
      workOrderToUpdate.status = body.status;

      const objUpdated = await this.workOrderRepository.update(
        id,
        workOrderToUpdate,
      );

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'workOrder',
        entry_id: workOrder.id,
        ip,
      });

      return objUpdated;
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteWorkOrder(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const WorkOrder: DeleteResult = await this.workOrderRepository.softDelete(
        id,
      );
      if (WorkOrder.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'workOrder',
        entry_id: id,
        ip,
      });
      return WorkOrder;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
