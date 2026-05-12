import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetTypeEntity } from '../entities/asset-type.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  AssetTypeDTO,
  AssetTypeDetailDTO,
  AssetTypeDetailsDTO,
  AssetTypeResultDTO,
  AssetTypeUpdateDTO,
  UpdateAssetTypeDetailDTO,
  UpdateAssetTypeDetailsDTO,
} from '../dto/asset-type.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { AssetTypeDetailsEntity } from '../entities/asset-type-details.entity';
import { Request } from 'express';

@Injectable()
export class AssetTypeService {
  constructor(
    @InjectRepository(AssetTypeEntity)
    private readonly AssetTypeRepository: Repository<AssetTypeEntity>,
    @InjectRepository(AssetTypeDetailsEntity)
    private readonly AssetTypeDetailsRepository: Repository<AssetTypeDetailsEntity>,
  ) {}

  public async createAssetType(
    body: AssetTypeDTO,
    user_id?: string,
  ): Promise<AssetTypeEntity> {
    try {
      const objAssetType = new AssetTypeEntity();
      objAssetType.name = body.name;
      objAssetType.category = body.category;

      const createdAssetType = await this.AssetTypeRepository.save(
        objAssetType,
      );

      await this.addAssetTypeDetails(body.details, createdAssetType);

      return objAssetType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async addAssetTypeDetails(
    details: AssetTypeDetailsDTO,
    assetType: AssetTypeEntity,
  ) {
    try {
      const _details = details?.forEach(async (detail) => {
        if (!detail || Array.isArray(detail)) {
          return null;
        }
        const assetTypeDetail = new AssetTypeDetailsEntity();
        assetTypeDetail.name = detail?.name;
        assetTypeDetail.required = detail?.required;
        assetTypeDetail.asset_type = assetType;

        return await this.AssetTypeDetailsRepository.save(assetTypeDetail);
      });

      return _details;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async updateAssetTypeDetails(details: UpdateAssetTypeDetailsDTO) {
    return details?.forEach(async (detail) => {
      const assetTypeDetail: Partial<AssetTypeDetailsEntity> = {
        name: detail.name,
        required: detail.required,
      };
      return await this.AssetTypeDetailsRepository.update(
        detail.id,
        assetTypeDetail,
      );
    });
  }

  public async findAssetType(
    page: number,
    limit: number,
    req: Request,
  ): Promise<AssetTypeResultDTO> {
    try {
      const queryBuilder =
        this.AssetTypeRepository.createQueryBuilder('asset_type');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `asset_type.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} asset_type.name ILIKE '%${
            req.query.search
          }%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [AssetType, totalElements] = await queryBuilder
        .leftJoinAndSelect('asset_type.details', 'details')
        .orderBy('asset_type.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...AssetType],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof AssetTypeDTO; value: any }) {
    try {
      const AssetType = await this.AssetTypeRepository.createQueryBuilder(
        'asset_type',
      )
        .where({ [key]: value })
        .leftJoinAndSelect('asset_type.details', 'details')
        .getOne();

      return AssetType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAssetTypeById(id: string): Promise<AssetTypeEntity> {
    try {
      const AssetType: AssetTypeEntity =
        await this.AssetTypeRepository.createQueryBuilder('asset_type')
          .where({ id })
          .leftJoinAndSelect('asset_type.details', 'details')
          .getOne();
      return AssetType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateAssetType(
    id: string,
    body: AssetTypeUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    console.log(body);
    try {
      const AssetTypeToUpdate = await this.AssetTypeRepository.findOneBy({
        id,
      });

      if (!AssetTypeToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Tipo de bien',
        });
      }
      const updateData: Partial<AssetTypeEntity> = {
        name: body.name,
        category: body.category,
      };

      let detailsToUpdate: UpdateAssetTypeDetailsDTO = [];
      let detailsToCreate: AssetTypeDetailsDTO = [];

      let asset_type_details = await this.AssetTypeDetailsRepository.find({
        where: { asset_type: { id: AssetTypeToUpdate.id } },
        relations: { asset_type: true },
      });

      body.details?.forEach(async (detail: any) => {
        if (detail?.id) {
          detailsToUpdate.push(detail);

          asset_type_details = asset_type_details.filter(
            (type_detail) => type_detail.id !== detail.id,
          );
        } else {
          detailsToCreate.push(detail);
        }
      });

      if (asset_type_details?.length > 0) {
        asset_type_details.forEach(
          async (detail) =>
            await this.AssetTypeDetailsRepository.softDelete(detail.id),
        );
      }

      await this.addAssetTypeDetails(detailsToCreate, AssetTypeToUpdate);
      await this.updateAssetTypeDetails(detailsToUpdate);

      return await this.AssetTypeRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteAssetType(id: string): Promise<DeleteResult | undefined> {
    try {
      const AssetType: DeleteResult = await this.AssetTypeRepository.softDelete(
        id,
      );
      if (AssetType.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return AssetType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
