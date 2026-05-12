import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TechnologyEntity } from '../entities/technology.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { TechnologyDTO, TechnologyResultDTO, TechnologyUpdateDTO } from '../dto/technology.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';

@Injectable()
export class TechnologyService {
  constructor(
    @InjectRepository(TechnologyEntity)
    private readonly technologyRepository: Repository<TechnologyEntity>,
  ) {}

  public async createTechnology(body: TechnologyDTO): Promise<TechnologyEntity> {
    try {
      const objTechnology = new TechnologyEntity()
      objTechnology.name = body.name
      objTechnology.slug = slugify(body.name, { lower: true });
      return await this.technologyRepository.save(objTechnology);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findTechnology(
    page: number,
    limit: number,
    search: string,
  ): Promise<TechnologyResultDTO> {
    try {
      const queryBuilder = this.technologyRepository.createQueryBuilder('technology');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'technology.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [technology, totalElements] = await queryBuilder
        .orderBy('technology.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...technology]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof TechnologyDTO; value: any }) {
    try {
      const technology = await this.technologyRepository
        .createQueryBuilder('technology')
        .where({ [key]: value })
        .getOne();

      return technology;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findTechnologyById(id: string): Promise<TechnologyEntity> {
    try {
      const technology: TechnologyEntity = await this.technologyRepository
        .createQueryBuilder('technology')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return technology;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateTechnology(
    id: string,
    body: TechnologyUpdateDTO,
  ): Promise<UpdateResult> {
    const technologyToUpdate = await this.findTechnologyById(id);
  
    if (!technologyToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<TechnologyEntity> = {
      name: body.name,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.technologyRepository.update(id, updateData);
  }

  public async deleteTechnology(id: string): Promise<DeleteResult | undefined> {
    try {
      const technology: DeleteResult = await this.technologyRepository.softDelete(id);
      if (technology.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return technology;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
