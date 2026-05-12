import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionTypeEntity } from '../entities/permissions-types.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PermissionTypeDTO, PermissionTypeResultDTO, PermissionTypeUpdateDTO } from '../dto/permissions-types.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';
import { v4 } from 'uuid';

@Injectable()
export class PermissionTypeService {
  constructor(
    @InjectRepository(PermissionTypeEntity)
    private readonly speedRepository: Repository<PermissionTypeEntity>,
  ) {}

  public async createPermissionType(body: PermissionTypeDTO): Promise<PermissionTypeEntity> {
    try {
      const objPermissionType = new PermissionTypeEntity()
      objPermissionType.name = body.name
      objPermissionType.maxiTimeAllowed = body.maxiTimeAllowed
      objPermissionType.unitTime = body.unitTime
      objPermissionType.slug = slugify(body.name, { lower: true });
      return await this.speedRepository.save(objPermissionType);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findPermissionType(
    page: number,
    limit: number,
    search: string,
  ): Promise<PermissionTypeResultDTO> {
    try {
      const queryBuilder = this.speedRepository.createQueryBuilder('speed');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'speed.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [speed, totalElements] = await queryBuilder
        .orderBy('speed.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...speed]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof PermissionTypeDTO; value: any }) {
    try {
      const speed = await this.speedRepository
        .createQueryBuilder('speed')
        .where({ [key]: value })
        .getOne();

      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findPermissionTypeById(id: string): Promise<PermissionTypeEntity> {
    try {
      const speed: PermissionTypeEntity = await this.speedRepository
        .createQueryBuilder('speed')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updatePermissionType(
    id: string,
    body: PermissionTypeUpdateDTO,
  ): Promise<UpdateResult> {
    const speedToUpdate = await this.findPermissionTypeById(id);
  
    if (!speedToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<PermissionTypeEntity> = {
      name: body.name,
      maxiTimeAllowed: body.maxiTimeAllowed,
      unitTime: body.unitTime,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.speedRepository.update(id, updateData);
  }

  public async deletePermissionType(id: string): Promise<DeleteResult | undefined> {
    try {
      const permissionToDelete = await this.findPermissionTypeById(id)

      const uuid = v4()

      await this.speedRepository.update(id, {name: `${permissionToDelete?.name}_deleted_${uuid}`})
      const speed: DeleteResult = await this.speedRepository.softDelete(id);
      if (speed.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
