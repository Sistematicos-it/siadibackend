import { Injectable } from '@nestjs/common';
import {
  AssetDTO,
  AssetDetailsDTO,
  AssetResultDTO,
  UpdateAssetDTO,
  UpdateAssetDetailsDTO,
} from '../dto/asset.dto';
import { AssetEntity } from '../entities/asset.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils';
import { AssetDetailsEntity } from '../entities/asset-details.entity';
import { ASSET_CATEGORY } from 'src/modules/nomencladores/asset-type/interfaces/asset-type.interface';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { Request } from 'express';
import { AssetTypeService } from 'src/modules/nomencladores/asset-type/services/asset-type.service';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { ROLES } from 'src/constants';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ASSET_STATUS } from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { v4 } from 'uuid';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly AssetRepository: Repository<AssetEntity>,

    @InjectRepository(AssetDetailsEntity)
    private readonly AssetDetailsRepository: Repository<AssetDetailsEntity>,

    @InjectRepository(PointEntity)
    private readonly PointRepository: Repository<PointEntity>,

    private readonly SecurityService: SecurityService,
    private readonly AssetTypeService: AssetTypeService,
    private readonly EmployeeService: EmployeeService,
  ) {}
  public async findAll(
    page: number,
    limit: number,
    req: Request,
  ): Promise<AssetResultDTO> {
    try {
      const queryBuilder = this.AssetRepository.createQueryBuilder('asset')
        .leftJoinAndSelect('asset.type', 'type')
        .leftJoinAndSelect(
          'asset.responsible_employee',
          'responsible_employee',
        );
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);
      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `asset.${key}`
            }='${values[i]}'`,
          );

          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} asset.observation ILIKE '%${
            req.query.search
          }%' OR  asset.code ILIKE '%${
            req.query.search
          }%' OR  asset.description ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const [Asset, totalElements] = await queryBuilder
        .orderBy('asset.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Asset],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOne(id: string): Promise<AssetEntity> {
    try {
      const Asset: AssetEntity = await this.AssetRepository.createQueryBuilder(
        'asset',
      )
        .where({ id })
        .leftJoinAndSelect('asset.type', 'type')
        .leftJoinAndSelect('asset.responsible_employee', 'responsible_employee')
        .leftJoinAndSelect('asset.details', 'details')
        .getOne();

      const AssetDetails: AssetDetailsEntity[] =
        await this.AssetDetailsRepository.find({
          where: { asset: { id: id, deletedAt: null } },
        });

      return Asset;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createAsset(
    body: AssetDTO,
    user_id?: string,
    ip?: string,
  ): Promise<AssetEntity> {
    try {
      const Asset = new AssetEntity();
      const exists = await this.findBy({ key: 'code', value: body?.code });

      if (exists) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El codigo registrado ya existe',
        });
      }

      Asset.code = body.code;
      Asset.description = body.description;
      Asset.observation = body.observation;
      Asset.status = body.status;
      Asset.isOldProject = body.isOldProject;
      Asset.amount = body.amount;
      Asset.cnt_code = body.cnt_code;
      Asset.asset_owner = body.asset_owner;

      if (body.type?.id) {
        const type = await this.AssetTypeService.findAssetTypeById(
          body?.type?.id,
        );

        Asset.type = type;
      }

      if (body?.responsible_employee?.id) {
        const employee = await this.EmployeeService.findEmployeeById(
          body.responsible_employee?.id,
        );
        Asset.responsible_employee = employee;
      }

      const createdAsset = await this.AssetRepository.save(body);

      if (body.details) {
        await this.addAssetDetails(body.details, createdAsset);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        user_id: user_id,
        entity: 'asset',
        entry_id: createdAsset.id,
        made_on: new Date(),
        ip,
      });

      return createdAsset;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addAssetDetails(details: AssetDetailsDTO, Asset: AssetEntity) {
    await this.AssetDetailsRepository.createQueryBuilder('asset_details')
      .leftJoin('asset_details.asset', 'asset')
      .where('asset.id = :id', { id: Asset.id })
      .delete()
      .execute();
    for (let i = 0; i < details?.length; i++) {
      const detail = details[i];
      const AssetDetail = new AssetDetailsEntity();
      AssetDetail.name = detail.name;
      AssetDetail.value = detail.value;
      AssetDetail.asset = Asset;
      await this.AssetDetailsRepository.save(AssetDetail);
    }

    return 'OK';
  }

  public async updateAssetDetails(details: UpdateAssetDetailsDTO) {
    return details?.forEach(async (detail) => {
      const AssetDetail: Partial<AssetDetailsEntity> = {
        name: detail.name,
        value: detail.value,
      };
      return await this.AssetDetailsRepository.update(detail.id, AssetDetail);
    });
  }

  public async findBy({ key, value }: { key: keyof AssetDTO; value: any }) {
    try {
      const Asset = await this.AssetRepository.createQueryBuilder('asset')
        .where({ [key]: value })
        .leftJoinAndSelect('asset.type', 'type')
        .leftJoinAndSelect('asset.responsible_employee', 'responsible_employee')
        .leftJoinAndSelect('asset.details', 'details')
        .getOne();

      return Asset;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateAsset(
    id: string,
    body: UpdateAssetDTO,
    user_id?: string,
    ip?: string,
  ): Promise<UpdateResult | undefined> {
    try {
      console.log(body);
      const AssetToUpdate = await this.AssetRepository.findOneBy({
        id,
      });

      if (!AssetToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la bien',
        });
      }

      const exists = await this.findBy({ key: 'code', value: body?.code });

      if (exists && AssetToUpdate?.id !== exists?.id) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El codigo registrado ya existe',
        });
      }

      const updateData: Partial<AssetEntity> = {
        description: body.description,
        observation: body.observation,
        code: body.code,
        cnt_code: body.cnt_code,
        asset_owner: body.asset_owner,
      };

      updateData.status = body.status;
      updateData.isOldProject = body.isOldProject;
      updateData.amount = body.amount;

      if (body.type?.id) {
        const type = await this.AssetTypeService.findAssetTypeById(
          body?.type?.id,
        );

        updateData.type = type;
      }

      if (body?.responsible_employee?.id) {
        const employee = await this.EmployeeService.findEmployeeById(
          body.responsible_employee?.id,
        );
        updateData.responsible_employee = employee;
      }

      if (body.details) {
        await this.addAssetDetails(body?.details, AssetToUpdate);
      }

      const updated = await this.AssetRepository.update(id, updateData);
      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'asset',
        entry_id: AssetToUpdate.id,
        ip,
      });

      return updated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async generateAssetDelivery(
    id: string,
    oldPorject?: boolean,
    category?: ASSET_CATEGORY,
    new_employee_id?: string,
    code?: string,
  ) {
    try {
      const employee = await this.EmployeeService.findEmployeeById(id);

      let new_employee: EmployeeEntity;

      if (new_employee_id) {
        new_employee = await this.EmployeeService.findEmployeeById(
          new_employee_id,
        );
      }

      const boss = await this.EmployeeService.getBoss(employee.id);

      const queryBuilder = this.AssetRepository.createQueryBuilder('asset')
        .leftJoinAndSelect('asset.type', 'type')
        .leftJoinAndSelect('asset.responsible_employee', 'responsible_employee')
        .leftJoinAndSelect('asset.details', 'details')
        .where('responsible_employee.id = :id', { id: employee.id });

      if (category) {
        queryBuilder.andWhere('type.category = :category', {
          category: category,
        });
      }

      console.log(oldPorject);

      if (oldPorject) {
        queryBuilder.andWhere('asset.isOldProject = :oldProject', {
          oldProject: oldPorject,
        });
      }

      const assets = await queryBuilder.getMany();

      let _assets = assets;

      let asset_types = [];
      _assets.forEach((asset) => {
        if (!asset_types.find((type) => type.type === asset.type.name)) {
          asset_types.push({
            type: asset.type.name,
            category: asset.type.category,
          });
        }
      });

      let asset_count = { technological: [], furniture: [] };

      asset_types.forEach((type) => {
        let t_countObj = {
          type: type.type,
          operative: 0,
          not_operative: 0,
          operative_issues: 0,
          total: 0,
        };

        let countObj = {
          type: type.type,
          functional: 0,
          not_functional: 0,
          functional_issues: 0,
          total: 0,
        };

        _assets.forEach((asset) => {
          if (asset.type.name === type.type) {
            if (type.category === ASSET_CATEGORY.TECHNOLOGICAL) {
              if (asset.status === ASSET_STATUS.OPERATIVE) {
                t_countObj.operative++;
                t_countObj.total++;
              }
              if (asset.status === ASSET_STATUS.NOT_OPERATIVE) {
                t_countObj.not_operative++;
                t_countObj.total++;
              }
              if (asset.status === ASSET_STATUS.OPERATIVE_WITH_ISSUES) {
                t_countObj.operative_issues++;
                t_countObj.total++;
              }
            }

            if (type.category === ASSET_CATEGORY.FURNITURE) {
              if (asset.status === ASSET_STATUS.FUNCTIONAL) {
                countObj.functional++;
                countObj.total++;
              }
              if (asset.status === ASSET_STATUS.NOT_FUNCTIONAL) {
                countObj.not_functional++;
                countObj.total++;
              }
              if (asset.status === ASSET_STATUS.FUNCTIONAL_WITH_ISSUES) {
                countObj.functional_issues++;
                countObj.total++;
              }
            }
          }
        });

        if (type.category === ASSET_CATEGORY.FURNITURE) {
          asset_count.furniture.push(countObj);
        }
        if (type.category === ASSET_CATEGORY.TECHNOLOGICAL) {
          asset_count.technological.push(t_countObj);
        }
      });

      let point: PointEntity;
      if (employee.user_type === ROLES.FACILITATOR) {
        point = await this.PointRepository.findOne({
          where: { facilitator_employee: { id: employee.id } },
          relations: {
            facilitator_employee: true,
            address: { parish: { canton: { province: { region: true } } } },
          },
        });
      }

      if (employee.user_type === ROLES.TECHNICAL_ASSISTENT) {
        point = await this.PointRepository.findOne({
          where: { technical_asistent_employee: { id: employee.id } },
          relations: {
            facilitator_employee: true,
            address: { parish: { canton: { province: { region: true } } } },
          },
        });
      }

      return {
        parish: point?.address?.parish?.name,
        province: point?.address?.parish?.canton?.province?.name,
        canton: point?.address?.parish?.canton?.name,
        code: `${point?.code ? point?.code : ''}${code}`,
        point,
        boss,
        new_employee,
        old_employee: employee,
        assets: [..._assets],
        asset_count,
      };
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async reassignResponsibleEmployee(old_id: string, new_id: string) {
    try {
      const assets = await this.AssetRepository.find({
        where: { responsible_employee: { id: old_id } },
        relations: { responsible_employee: true },
      });

      const new_employee = await this.EmployeeService.findEmployeeById(new_id);

      assets.forEach(
        async (asset) =>
          await this.AssetRepository.update(asset.id, {
            responsible_employee: new_employee,
          }),
      );

      return { data: 'Bienes reasignados exitosamente' };
    } catch (error) {
      console.log(error);
    }
  }

  public async deleteAsset(
    id: string,
    user_id?: string,
    ip?: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const _Asset = await this.AssetRepository.findOneBy({ id });

      await this.updateAsset(id, { code: _Asset?.code + v4() });

      const assetDetails = await this.AssetDetailsRepository.createQueryBuilder(
        'asset_details',
      )
        .leftJoin('asset_details.asset', 'asset')
        .softDelete()
        .where('asset.id = :id', { id: _Asset.id })
        .execute();

      const Asset: DeleteResult = await this.AssetRepository.softDelete(id);
      if (Asset.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'asset',
        entry_id: _Asset.id,
        ip,
      });
      return Asset;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
