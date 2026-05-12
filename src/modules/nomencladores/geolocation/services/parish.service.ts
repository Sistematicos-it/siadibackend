import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParishEntity } from '../entities/parish.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { ParishDTO, ParishResultDTO, ParishUpdateDTO } from '../dto/parish.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { CantonService } from './canton.service';
import { Request } from 'express';

@Injectable()
export class ParishService {
  constructor(
    @InjectRepository(ParishEntity)
    private readonly parishRepository: Repository<ParishEntity>,

    private readonly cantonService: CantonService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.parishRepository.createQueryBuilder('parish');

    query = query.where('parish.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('parish.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }
  async checkIfParishExists(name: string, cantonId?: string, excludeId?: string): Promise<boolean> {
    let query = this.parishRepository.createQueryBuilder('parish');
    query = query.where('parish.name ILIKE :name', { name });
    if (cantonId !== undefined) {
      query = query.andWhere('parish.canton_id = :cantonId', { cantonId });
    }
    if (excludeId !== undefined) {
      query = query.andWhere('parish.id != :excludeId', { excludeId });
    }
    const existingItem = await query.getOne();    
    return !!existingItem;
  }

  public async createParish(body: ParishDTO): Promise<ParishEntity> {
    try {
      const objCanton = await this.cantonService.findCantonById(body.canton)
      const objParish = new ParishEntity()
      objParish.name = body.name
      objParish.type = body.type
      objParish.canton = objCanton
      return await this.parishRepository.save(objParish);
    } catch (error) {
      console.log(error);
      console.log(error);
      
      throw new Error(error);
    }
  }

  public async findParish(
    page: number,
    limit: number,
    search: string,
    detail: string,
    req?:Request
  ): Promise<ParishResultDTO> {
    try {
      const queryBuilder = this.parishRepository.createQueryBuilder('parish');

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
          key !== 'detail'
        ) {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `parish.${key}`
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
          'parish.name ILIKE :search OR canton.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [parish, totalElements] = await queryBuilder
        .leftJoinAndSelect('parish.canton', 'canton')
        .leftJoinAndSelect('parish.addresses', 'addresses')
        .leftJoinAndSelect('parish.canton','province')
        //.orderBy('parish.updatedAt', 'DESC')
        .orderBy('parish.name', 'ASC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
       
      const totalPages = Math.ceil(totalElements / pageLimit);
      if (detail){
        //en este caso complemento el nombre de la parroquia con el cantón y provincia (3 primeras letras)        
        parish.forEach( p => {
          p.name = p.name + " - " + p.canton.name 
        });
      }
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...parish]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ParishDTO; value: any }) {
    try {
      const parish = await this.parishRepository
        .createQueryBuilder('parish')
        .leftJoinAndSelect('parish.canton', 'canton')
        .leftJoinAndSelect('parish.addresses', 'addresses')
        .where({ [key]: value })
        .getOne();

      return parish;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findParishById(id: string): Promise<ParishEntity> {
    try {
      const parish: ParishEntity = await this.parishRepository
        .createQueryBuilder('parish')
        .leftJoinAndSelect('parish.addresses', 'addresses')
        .where({ id })
        .getOne();
      return parish;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateParish(
    id: string,
    body: ParishUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const parishToUpdate = await this.parishRepository.findOneBy({id});

      if (!parishToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la parroquia',
        });
      }
      const objCanton = await this.cantonService.findCantonById(body.canton)
      const updateData: Partial<ParishEntity> = {
        name: body.name,
        type: body.type,
        canton: objCanton ? objCanton : null
      };
      return await this.parishRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteParish(id: string): Promise<DeleteResult | undefined> {
    try {
      const parish: DeleteResult = await this.parishRepository.softDelete(id);
      if (parish.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return parish;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
