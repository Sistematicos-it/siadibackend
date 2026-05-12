import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SharingEntity } from '../entities/sharing.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SharingDTO, SharingResultDTO, SharingUpdateDTO } from '../dto/sharing.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';

@Injectable()
export class SharingService {
  constructor(
    @InjectRepository(SharingEntity)
    private readonly sharingRepository: Repository<SharingEntity>,
  ) {}

  public async createSharing(body: SharingDTO): Promise<SharingEntity> {
    try {
      const objSharing = new SharingEntity()
      objSharing.name = body.name
      objSharing.slug = slugify(body.name, { lower: true });
      return await this.sharingRepository.save(objSharing);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findSharing(
    page: number,
    limit: number,
    search: string,
  ): Promise<SharingResultDTO> {
    try {
      const queryBuilder = this.sharingRepository.createQueryBuilder('sharing');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'sharing.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [sharing, totalElements] = await queryBuilder
        .orderBy('sharing.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...sharing]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof SharingDTO; value: any }) {
    try {
      const sharing = await this.sharingRepository
        .createQueryBuilder('sharing')
        .where({ [key]: value })
        .getOne();

      return sharing;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSharingById(id: string): Promise<SharingEntity> {
    try {
      const sharing: SharingEntity = await this.sharingRepository
        .createQueryBuilder('sharing')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return sharing;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateSharing(
    id: string,
    body: SharingUpdateDTO,
  ): Promise<UpdateResult> {
    const sharingToUpdate = await this.findSharingById(id);
  
    if (!sharingToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<SharingEntity> = {
      name: body.name,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.sharingRepository.update(id, updateData);
  }

  public async deleteSharing(id: string): Promise<DeleteResult | undefined> {
    try {
      const sharing: DeleteResult = await this.sharingRepository.softDelete(id);
      if (sharing.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return sharing;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
