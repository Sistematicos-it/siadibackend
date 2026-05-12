import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivitieEntity } from '../entities/activitie.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ActivitieDTO, ActivitieResultDTO, ActivitieUpdateDTO } from '../dto/activitie.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';

@Injectable()
export class ActivitieService {
  constructor(
    @InjectRepository(ActivitieEntity)
    private readonly activitieRepository: Repository<ActivitieEntity>,
  ) {}

  public async createActivitie(body: ActivitieDTO): Promise<ActivitieEntity> {
    try {
      const objActivitie = new ActivitieEntity()
      objActivitie.name = body.name
      objActivitie.slug = slugify(body.name, { lower: true });
      return await this.activitieRepository.save(objActivitie);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findActivitie(
    page: number,
    limit: number,
    search: string,
  ): Promise<ActivitieResultDTO> {
    try {
      const queryBuilder = this.activitieRepository.createQueryBuilder('activitie');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'activitie.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [activitie, totalElements] = await queryBuilder
        .orderBy('activitie.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...activitie]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ActivitieDTO; value: any }) {
    try {
      const activitie = await this.activitieRepository
        .createQueryBuilder('activitie')
        .where({ [key]: value })
        .getOne();

      return activitie;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findActivitieById(id: string): Promise<ActivitieEntity> {
    try {
      const activitie: ActivitieEntity = await this.activitieRepository
        .createQueryBuilder('activitie')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return activitie;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateActivitie(
    id: string,
    body: ActivitieUpdateDTO,
  ): Promise<UpdateResult> {
    const activitieToUpdate = await this.findActivitieById(id);
  
    if (!activitieToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<ActivitieEntity> = {
      name: body.name,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.activitieRepository.update(id, updateData);
  }

  public async deleteActivitie(id: string): Promise<DeleteResult | undefined> {
    try {
      const activitie: DeleteResult = await this.activitieRepository.softDelete(id);
      if (activitie.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return activitie;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
