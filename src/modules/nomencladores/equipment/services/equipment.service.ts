import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EquipmentEntity } from '../entities/equipment.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  EquipmentDTO,
  EquipmentResultDTO,
  EquipmentUpdateDTO,
} from '../dto/equipment.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 } from 'uuid';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(EquipmentEntity)
    private readonly equipmentRepository: Repository<EquipmentEntity>,
  ) {}

  public async createEquipment(
    body: EquipmentDTO,
  ): Promise<EquipmentEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }
      const objEquipment = new EquipmentEntity();
      objEquipment.name = body.name;
      return await this.equipmentRepository.save(objEquipment);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findEquipment(
    page: number,
    limit: number,
    search: string,
  ): Promise<EquipmentResultDTO> {
    try {
      const queryBuilder =
        this.equipmentRepository.createQueryBuilder('equipment');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('equipment.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Equipment, totalElements] = await queryBuilder
        .orderBy('equipment.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Equipment],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof EquipmentDTO;
    value: any;
  }) {
    try {
      const Equipment =
        await this.equipmentRepository.createQueryBuilder('equipment')
          .where({ [key]: value })
          .getOne();

      return Equipment;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEquipmentById(
    id: string,
  ): Promise<EquipmentEntity> {
    try {
      const Equipment: EquipmentEntity =
        await this.equipmentRepository.createQueryBuilder('equipment')
          .where({ id })
          .getOne();
      return Equipment;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findEquipmentByIds(
    ids: string[],
  ): Promise<EquipmentEntity[]> {
    try {
      return await this.equipmentRepository.findBy({ id: In(ids) });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateEquipment(
    id: string,
    body: EquipmentUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const EquipmentToUpdate =
        await this.equipmentRepository.findOneBy({ id });

      if (!EquipmentToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }

      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists && EquipmentToUpdate?.id !== exists?.id){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }
      const updateData: Partial<EquipmentEntity> = {
        name: body.name,
      };
      return await this.equipmentRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteEquipment(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.equipmentRepository.update(id, {name: v4()})
      const Equipment: DeleteResult =
        await this.equipmentRepository.softDelete(id);
      if (Equipment.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Equipment;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
