import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComponentEntity } from '../entities/component.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  ComponentDTO,
  ComponentResultDTO,
  ComponentUpdateDTO,
} from '../dto/component.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class ComponentService {
  constructor(
    @InjectRepository(ComponentEntity)
    private readonly componentRepository: Repository<ComponentEntity>,
  ) {}

  public async createComponent(body: ComponentDTO): Promise<ComponentEntity> {
    try {
      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }
      const objComponent = new ComponentEntity();
      objComponent.name = body.name;
      return await this.componentRepository.save(objComponent);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findComponent(
    page: number,
    limit: number,
    req: Request,
  ): Promise<ComponentResultDTO> {
    try {
      const queryBuilder =
        this.componentRepository.createQueryBuilder('component');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `component.${key}`}='${values[i]}'`,
          );
          realIndex++
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} component.name ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Component, totalElements] = await queryBuilder
        .orderBy('component.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Component],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ComponentDTO; value: any }) {
    try {
      const Component = await this.componentRepository
        .createQueryBuilder('component')
        .where({ [key]: value })
        .getOne();

      return Component;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findComponentById(id: string): Promise<ComponentEntity> {
    try {
      const Component: ComponentEntity = await this.componentRepository
        .createQueryBuilder('component')
        .where({ id })
        .getOne();
      return Component;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findComponentByIds(ids: string[]): Promise<ComponentEntity[]> {
    try {
      return await this.componentRepository.findBy({ id: In(ids) });
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateComponent(
    id: string,
    body: ComponentUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const ComponentToUpdate = await this.componentRepository.findOneBy({
        id,
      });

      if (!ComponentToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Institucion',
        });
      }

      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists && ComponentToUpdate?.id !== exists?.id){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'El nombre ya existe'})
      }
      const updateData: Partial<ComponentEntity> = {
        name: body.name,
      };
      return await this.componentRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteComponent(id: string): Promise<DeleteResult | undefined> {
    try {

      await this.componentRepository.update(id, {name: v4()})
      const Component: DeleteResult = await this.componentRepository.softDelete(
        id,
      );
      if (Component.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Component;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
