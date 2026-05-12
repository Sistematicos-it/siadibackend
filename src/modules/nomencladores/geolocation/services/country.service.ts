import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CountryEntity } from '../entities/country.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { CountryDTO, CountryResultDTO, CountryUpdateDTO } from '../dto/country.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.countryRepository.createQueryBuilder('country');

    query = query.where('country.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('country.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createCountry(body: CountryDTO): Promise<CountryEntity> {
    try {
      const objCountry = new CountryEntity()
      objCountry.name = body.name
      objCountry.code = body.code
      objCountry.slug = slugify(body.name, { lower: true });


      return await this.countryRepository.save(objCountry);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findCountry(
    page: number,
    limit: number,
    search: string,
    req?:Request
  ): Promise<CountryResultDTO> {
    try {
      const queryBuilder = this.countryRepository.createQueryBuilder('country');

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
              key.split('.').length > 1 ? key : `country.${key}`
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
          'country.code ILIKE :search OR country.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [country, totalElements] = await queryBuilder
        .leftJoinAndSelect('country.regions', 'regions')
        .orderBy('country.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...country]
      };
    } catch (error) {
      console.log(error);
      console.log('%ccountry.service.ts line:111 error', 'color: #007acc;', error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof CountryDTO; value: any }) {
    try {
      const country = await this.countryRepository
        .createQueryBuilder('country')
        .leftJoinAndSelect('country.regions', 'regions')
        .where({ [key]: value })
        .getOne();

      return country;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCountryById(id: string): Promise<CountryEntity> {
    try {
      const country: CountryEntity = await this.countryRepository
        .createQueryBuilder('country')
        .leftJoinAndSelect('country.regions', 'regions')
        .where({ id })
        .getOne();
      return country;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCountry(
    id: string,
    body: CountryUpdateDTO,
  ): Promise<UpdateResult> {
    const countryToUpdate = await this.findCountryById(id);
  
    if (!countryToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<CountryEntity> = {
      code: body.code,
      name: body.name,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.countryRepository.update(id, updateData);
  }

  public async deleteCountry(id: string): Promise<DeleteResult | undefined> {
    try {
      // const objCountry = await this.countryRepository.findOneBy({ id });
      await this.countryRepository.update(id, {code: v4(), name: v4()})
      const country: DeleteResult = await this.countryRepository.softDelete(id);
      if (country.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return country;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
