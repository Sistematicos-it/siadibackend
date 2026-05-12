import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CantonEntity } from '../entities/canton.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { CantonDTO, CantonResultDTO, CantonUpdateDTO } from '../dto/canton.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { ProvinceService } from './province.service';
import { Request } from 'express';

@Injectable()
export class CantonService {
  constructor(
    @InjectRepository(CantonEntity)
    private readonly cantonRepository: Repository<CantonEntity>,

    private readonly provinceService: ProvinceService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.cantonRepository.createQueryBuilder('canton');

    query = query.where('canton.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('canton.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  async checkIfCantonExists(name: string, province?: string, excludeId?: string): Promise<boolean> {
    let query = this.cantonRepository.createQueryBuilder('canton');
    query = query.where('canton.name ILIKE :name', { name });
    if (province !== undefined) {
      query = query.andWhere('canton.province_id = :province', { province });
    }
    if (excludeId !== undefined) {
      query = query.andWhere('canton.id != :excludeId', { excludeId });
    }
    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createCanton(body: CantonDTO): Promise<CantonEntity> {
    try {
      const objProvince = await this.provinceService.findProvinceById(
        body.province,
      );
      const objCanton = new CantonEntity();
      objCanton.name = body.name;
      objCanton.province = objProvince;
      return await this.cantonRepository.save(objCanton);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findCanton(
    page: number,
    limit: number,
    search: string,
    province_id?: string,
    req?: Request
  ): Promise<CantonResultDTO> {
    try {
      const queryBuilder = this.cantonRepository.createQueryBuilder('canton');

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
              key.split('.').length > 1 ? key : `canton.${key}`
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
          'canton.name ILIKE :search OR province.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      if (province_id) {
        queryBuilder.andWhere('province.id = :id', { id: province_id });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [canton, totalElements] = await queryBuilder
        .leftJoinAndSelect('canton.province', 'province')
        .leftJoinAndSelect('canton.parishes', 'parishes')
        .orderBy('canton.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...canton],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof CantonDTO; value: any }) {
    try {
      const canton = await this.cantonRepository
        .createQueryBuilder('canton')
        .leftJoinAndSelect('canton.province', 'province')
        .leftJoinAndSelect('canton.parishes', 'parishes')
        .where({ [key]: value })
        .getOne();

      return canton;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCantonById(id: string): Promise<CantonEntity> {
    try {
      const canton: CantonEntity = await this.cantonRepository
        .createQueryBuilder('canton')
        .where({ id })
        .leftJoinAndSelect('canton.parishes', 'parishes')
        .getOne();
      return canton;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCanton(
    id: string,
    body: CantonUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const cantonToUpdate = await this.findCantonById(id);

      if (!cantonToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la canton',
        });
      }
      const objProvince = await this.provinceService.findProvinceById(
        body.province,
      );
      const updateData: Partial<CantonEntity> = {
        name: body.name,
        province: objProvince ? objProvince : null,
      };
      return await this.cantonRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCanton(id: string): Promise<DeleteResult | undefined> {
    try {
      const canton: DeleteResult = await this.cantonRepository.softDelete(id);
      if (canton.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return canton;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
