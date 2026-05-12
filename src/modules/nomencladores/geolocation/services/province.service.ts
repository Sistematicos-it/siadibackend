import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProvinceEntity } from '../entities/province.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { ErrorManager } from '../../../../utils/error.manager';
import { RegionService } from './region.service';
import { ProvinceDTO, ProvinceResultDTO, ProvinceUpdateDTO } from '../dto/province.dto';
import { Request } from 'express';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(ProvinceEntity)
    private readonly provinceRepository: Repository<ProvinceEntity>,

    private readonly regionService: RegionService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.provinceRepository.createQueryBuilder('province');

    query = query.where('province.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('province.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createProvince(body: ProvinceDTO): Promise<ProvinceEntity> {
    try {
      const objRegion = await this.regionService.findRegionById(body.region)
      const objProvince = new ProvinceEntity()
      objProvince.name = body.name
      objProvince.region = objRegion
      return await this.provinceRepository.save(objProvince);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findProvince(
    page: number,
    limit: number,
    search: string,
    req?:Request
  ): Promise<ProvinceResultDTO> {
    try {
      const queryBuilder = this.provinceRepository.createQueryBuilder('province');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'search' &&
          key !== 'incidentType' &&
          key !== 'employeeType'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `province.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if(query_string){
        queryBuilder.andWhere(query_string)
      }

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.andWhere(
          'province.name ILIKE :search OR region.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [province, totalElements] = await queryBuilder
        .leftJoinAndSelect('province.region', 'region')
        .leftJoinAndSelect('province.cantons', 'cantons')
        .orderBy('province.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...province]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ProvinceDTO; value: any }) {
    try {
      const province = await this.provinceRepository
        .createQueryBuilder('province')
        .leftJoinAndSelect('province.region', 'region')
        .leftJoinAndSelect('province.cantons', 'cantons')
        .where({ [key]: value })
        .getOne();

      return province;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProvinceById(id: string): Promise<ProvinceEntity> {
    try {
      const province: ProvinceEntity = await this.provinceRepository
        .createQueryBuilder('province')
        .leftJoinAndSelect('province.region', 'region')
        .leftJoinAndSelect('province.cantons', 'cantons')
        .where({ id })
        .getOne();
      return province;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProvince(
    id: string,
    body: ProvinceUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const provinceToUpdate = await this.findProvinceById(id);

      if (!provinceToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la province',
        });
      }
      const objRegion = await this.regionService.findRegionById(body.region)
      const updateData: Partial<ProvinceEntity> = {
        name: body.name,
        region: objRegion ? objRegion : null
      };
      return await this.provinceRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteProvince(id: string): Promise<DeleteResult | undefined> {
    try {
      const province: DeleteResult = await this.provinceRepository.softDelete(id);
      if (province.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return province;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
