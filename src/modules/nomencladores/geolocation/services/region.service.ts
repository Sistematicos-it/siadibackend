import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegionEntity } from '../entities/region.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { RegionDTO, RegionResultDTO, RegionUpdateDTO } from '../dto/region.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { CountryService } from './country.service';
import { Request } from 'express';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(RegionEntity)
    private readonly regionRepository: Repository<RegionEntity>,

    private readonly countryService: CountryService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.regionRepository.createQueryBuilder('region');

    query = query.where('region.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('region.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createRegion(body: RegionDTO): Promise<RegionEntity> {
    try {
      const objCountry = await this.countryService.findCountryById(body.country)
      const objRegion = new RegionEntity()
      objRegion.name = body.name
      objRegion.country = objCountry
      return await this.regionRepository.save(objRegion);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findRegion(
    page: number,
    limit: number,
    search: string,
    req?: Request
  ): Promise<RegionResultDTO> {
    try {
      const queryBuilder = this.regionRepository.createQueryBuilder('region');
      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'search'
          
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `region.${key}`
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
        queryBuilder.where(
          'region.name ILIKE :search OR country.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [region, totalElements] = await queryBuilder
        .leftJoinAndSelect('region.country', 'country')
        .leftJoinAndSelect('region.provinces', 'provinces')
        .orderBy('region.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...region]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof RegionDTO; value: any }) {
    try {
      const region = await this.regionRepository
        .createQueryBuilder('region')
        .leftJoinAndSelect('region.country', 'country')
        .leftJoinAndSelect('region.provinces', 'provinces')
        .where({ [key]: value })
        .getOne();

      return region;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findRegionById(id: string): Promise<RegionEntity> {
    try {
      const region: RegionEntity = await this.regionRepository
        .createQueryBuilder('region')
        .leftJoinAndSelect('region.country', 'country')
        .leftJoinAndSelect('region.provinces', 'provinces')
        .where({ id })
        .getOne();
      return region;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateRegion(
    id: string,
    body: RegionUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const regionToUpdate = await this.findRegionById(id);

      if (!regionToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la region',
        });
      }
      const objCountry = await this.countryService.findCountryById(body.country)
      const updateData: Partial<RegionEntity> = {
        name: body.name,
        country: objCountry ? objCountry : null
      };
      return await this.regionRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteRegion(id: string): Promise<DeleteResult | undefined> {
    try {
      const region: DeleteResult = await this.regionRepository.softDelete(id);
      if (region.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return region;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
