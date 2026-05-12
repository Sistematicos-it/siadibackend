import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeneficiaryTypeEntity } from '../entities/beneficiary-type.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  BeneficiaryTypeDTO,
  BeneficiaryTypeResultDTO,
  BeneficiaryTypeUpdateDTO,
} from '../dto/beneficiary-type.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { Request } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class BeneficiaryTypeService {
  constructor(
    @InjectRepository(BeneficiaryTypeEntity)
    private readonly BeneficiaryTypeRepository: Repository<BeneficiaryTypeEntity>,
  ) {}

  public async createBeneficiaryType(
    body: BeneficiaryTypeDTO,
  ): Promise<BeneficiaryTypeEntity> {
    try {

      const exists = await this.findBy({key: 'name', value: body?.name})

      if(exists){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }

      const objBeneficiaryType = new BeneficiaryTypeEntity();
      objBeneficiaryType.name = body.name;
      return await this.BeneficiaryTypeRepository.save(objBeneficiaryType);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error?.message)
    }
  }

  public async findBeneficiaryType(
    page: number,
    limit: number,
    req: Request
  ): Promise<BeneficiaryTypeResultDTO> {
    try {
      const queryBuilder =
        this.BeneficiaryTypeRepository.createQueryBuilder('beneficiary_type');

        let query_string = '';

        const filters = req.query;
  
        const keys = Object.keys(filters);
  
        const values = Object.values(filters);
  
        let realIndex = 0
        keys.forEach((key, i) => {
          if (key !== 'page' && key !== 'limit' && key !== 'search') {
            query_string = query_string.concat(
              `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `beneficiary_type.${key}`}='${values[i]}'`,
            );
            realIndex++
          }
        });
  
        if (req.query.search) {
          query_string = query_string.concat(
            `${query_string ? ' AND ' : ''} beneficiary_type.name ILIKE '%${req.query.search}%'`,
          );
        }
  
         if (query_string) {
            queryBuilder.where(query_string);
          }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [BeneficiaryType, totalElements] = await queryBuilder
        .orderBy('beneficiary_type.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...BeneficiaryType],
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
    key: keyof BeneficiaryTypeDTO;
    value: any;
  }) {
    try {
      const BeneficiaryType =
        await this.BeneficiaryTypeRepository.createQueryBuilder('beneficiary_type')
          .where({ [key]: value })
          .getOne();

      return BeneficiaryType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBeneficiaryTypeById(
    id: string,
  ): Promise<BeneficiaryTypeEntity> {
    try {
      const BeneficiaryType: BeneficiaryTypeEntity =
        await this.BeneficiaryTypeRepository.createQueryBuilder('beneficiary_type')
          .where({ id })
          .getOne();
      return BeneficiaryType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateBeneficiaryType(
    id: string,
    body: BeneficiaryTypeUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const BeneficiaryTypeToUpdate =
        await this.BeneficiaryTypeRepository.findOneBy({ id });

        const exists = await this.findBy({key: 'name', value: body?.name})

   

      if (!BeneficiaryTypeToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Tipo de Beneficiario',
        });
      }

      if(exists?.id !== BeneficiaryTypeToUpdate?.id){
        throw new ErrorManager({type: 'BAD_REQUEST', message: 'Ese nombre ya existe'})
      }
      const updateData: Partial<BeneficiaryTypeEntity> = {
        name: body.name,
      };
      return await this.BeneficiaryTypeRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteBeneficiaryType(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      await this.BeneficiaryTypeRepository.update(id, {name: v4()})
      const BeneficiaryType: DeleteResult =
        await this.BeneficiaryTypeRepository.softDelete(id);
      if (BeneficiaryType.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return BeneficiaryType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
