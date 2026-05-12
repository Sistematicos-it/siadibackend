import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileCategoryEntity } from '../entities/file-category.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  FileCategoryDTO,
  FileCategoryResultDTO,
  FileCategoryUpdateDTO,
} from '../dto/file-category.dto';
import { ErrorManager } from '../../../utils/error.manager';
import slugify from 'slugify';

@Injectable()
export class FileCategoryService {
  constructor(
    @InjectRepository(FileCategoryEntity)
    private readonly fileCategoryRepository: Repository<FileCategoryEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.fileCategoryRepository.createQueryBuilder('fileCategory');

    query = query.where('fileCategory.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('fileCategory.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createFileCategory(
    body: FileCategoryDTO,
  ): Promise<FileCategoryEntity> {
    try {
      const objFileCategory = new FileCategoryEntity();
      objFileCategory.name = body.name;
      objFileCategory.slug = slugify(body.name, {lower: true});
      return await this.fileCategoryRepository.save(objFileCategory);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findFileCategory(
    page: number,
    limit: number,
    search: string,
  ): Promise<FileCategoryResultDTO> {
    try {
      const queryBuilder =
        this.fileCategoryRepository.createQueryBuilder('fileCategory');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('fileCategory.name ILIKE :search OR fileCategory.slug ILIKE :search', {
          search: `%${slugify(search, { lower: true })}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [FileCategory, totalElements] = await queryBuilder
        .orderBy('fileCategory.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...FileCategory],
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
    key: keyof FileCategoryDTO;
    value: any;
  }) {
    try {
      const FileCategory =
        await this.fileCategoryRepository.createQueryBuilder('fileCategory')
          .where({ [key]: value })
          .getOne();

      return FileCategory;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findFileCategoryById(
    id: string,
  ): Promise<FileCategoryEntity> {
    try {
      const FileCategory: FileCategoryEntity =
        await this.fileCategoryRepository.createQueryBuilder('fileCategory')
          .where({ id })
          .getOne();
      return FileCategory;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateFileCategory(
    id: string,
    body: FileCategoryUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const FileCategoryToUpdate =
        await this.fileCategoryRepository.findOneBy({ id });

      if (!FileCategoryToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Archivo de la Categoria',
        });
      }
      const updateData: Partial<FileCategoryEntity> = {
        name: body.name,
        slug: slugify(body.name, {lower: true})
      };
      return await this.fileCategoryRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteFileCategory(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const FileCategory: DeleteResult =
        await this.fileCategoryRepository.softDelete(id);
      if (FileCategory.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return FileCategory;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
