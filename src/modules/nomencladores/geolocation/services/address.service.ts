import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from '../entities/address.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  AddressDTO,
  AddressResultDTO,
  AddressUpdateDTO,
} from '../dto/address.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { ParishService } from './parish.service';
import { Request } from 'express';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,

    private readonly parishService: ParishService,
  ) {}

  public async createAddress(body: AddressDTO): Promise<AddressEntity> {
    try {
      const objParish = await this.parishService.findParishById(body.parish);
      const objAddress = new AddressEntity();
      objAddress.description = body.description;
      objAddress.mainStreet = body.mainStreet;
      objAddress.secondaryStreet = body.secondaryStreet;
      objAddress.postalCode = body.postalCode;
      objAddress.latitude = body.latitude;
      objAddress.longitude = body.longitude;
      objAddress.parish = objParish;
      return await this.addressRepository.save(objAddress);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findAddress(
    page: number,
    limit: number,
    search: string,
    req?:Request
  ): Promise<AddressResultDTO> {
    try {
      const queryBuilder = this.addressRepository
        .createQueryBuilder('address')
        .leftJoinAndSelect('address.parish', 'parish')
        .leftJoinAndSelect('parish.canton', 'canton')
        .leftJoinAndSelect('canton.province', 'province');

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
              key.split('.').length > 1 ? key : `address.${key}`
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
          'address.description ILIKE :search OR parish.name ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [address, totalElements] = await queryBuilder

        .orderBy('address.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...address],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof AddressDTO; value: any }) {
    try {
      const address = await this.addressRepository
        .createQueryBuilder('address')
        .leftJoinAndSelect('address.parish', 'parish')
        .where({ [key]: value })
        .getOne();

      return address;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAddressById(id: string): Promise<AddressEntity> {
    try {
      const address: AddressEntity = await this.addressRepository
        .createQueryBuilder('address')
        .where({ id })
        .getOne();
      return address;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateAddress(
    id: string,
    body: AddressUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const addressToUpdate = await this.addressRepository.findOneBy({ id });

      if (!addressToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la address',
        });
      }
      const objParish = await this.parishService.findParishById(body.parish);
      const updateData: Partial<AddressEntity> = {
        description: body.description,
        mainStreet: body.mainStreet,
        secondaryStreet: body.secondaryStreet,
        postalCode: body.postalCode,
        latitude: body.latitude,
        longitude: body.longitude,
        parish: objParish ? objParish : null,
      };
      return await this.addressRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteAddress(id: string): Promise<DeleteResult | undefined> {
    try {
      const address: DeleteResult = await this.addressRepository.softDelete(id);
      if (address.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return address;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
