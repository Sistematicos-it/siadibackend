import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CitizenshipEntity } from '../entities/citizenship.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { CitizenshipDTO, CitizenshipResultDTO, CitizenshipUpdateDTO } from '../dto/citizenship.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';
import { v4 } from 'uuid';

@Injectable()
export class CitizenshipService {
  constructor(
    @InjectRepository(CitizenshipEntity)
    private readonly citizenshipRepository: Repository<CitizenshipEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.citizenshipRepository.createQueryBuilder('citizenship');

    query = query.where('citizenship.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('citizenship.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createCitizenship(body: CitizenshipDTO): Promise<CitizenshipEntity> {
    try {
      const objCitizenship = new CitizenshipEntity()
      objCitizenship.name = body.name
      objCitizenship.slug = slugify(body.name, { lower: true });
      return await this.citizenshipRepository.save(objCitizenship);
    } catch (error) {
      console.log(error);
      console.log('%ccitizenship.service.ts line:37 error', 'color: #007acc;', error);
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async findCitizenship(
    page: number,
    limit: number,
    search: string,
  ): Promise<CitizenshipResultDTO> {
    try {
      const queryBuilder = this.citizenshipRepository.createQueryBuilder('citizenship');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'citizenship.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [citizenship, totalElements] = await queryBuilder
        .orderBy('citizenship.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...citizenship]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof CitizenshipDTO; value: any }) {
    try {
      const citizenship = await this.citizenshipRepository
        .createQueryBuilder('citizenship')
        .where({ [key]: value })
        .getOne();

      return citizenship;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCitizenshipById(id: string): Promise<CitizenshipEntity> {
    try {
      const citizenship: CitizenshipEntity = await this.citizenshipRepository
        .createQueryBuilder('citizenship')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return citizenship;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCitizenship(
    id: string,
    body: CitizenshipUpdateDTO,
  ): Promise<UpdateResult> {
    const citizenshipToUpdate = await this.findCitizenshipById(id);
  
    if (!citizenshipToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<CitizenshipEntity> = {
      name: body.name,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.citizenshipRepository.update(id, updateData);
  }

  public async deleteCitizenship(id: string): Promise<DeleteResult | undefined> {
    try {

      const citizenshipToDelete = await this.citizenshipRepository.findOneBy({id})
      const uuid = v4()
      await this.citizenshipRepository.update(id, {name: `${citizenshipToDelete?.name}_deleted_${uuid}`, slug: `${citizenshipToDelete?.slug}_deleted_${uuid}`})

      
      const citizenship: DeleteResult = await this.citizenshipRepository.softDelete(id);
      if (citizenship.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return citizenship;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
