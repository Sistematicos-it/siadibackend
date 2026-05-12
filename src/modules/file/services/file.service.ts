import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../entities/file.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  FileDTO,
  FileKeyToSearchDTO,
  FileOptionsDTO,
  FileOptionsToDeleteDTO,
  FileResultDTO,
  FileUpdateDTO,
} from '../dto/file.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileCategoryService } from './file-category.service';
import { FileCategoryEntity } from '../entities/file-category.entity';
import slugify from 'slugify';
import { FILE_ENTITY_NAMES } from 'src/constants/enums';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileCategory: FileCategoryService,
  ) {}

  public async findFile(
    page: number,
    limit: number,
    search: string,
  ): Promise<FileResultDTO> {
    try {
      const queryBuilder = this.fileRepository.createQueryBuilder('files');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('files.name LIKE :search', {
          search: `%${slugify(search, { lower: true })}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [file, totalElements] = await queryBuilder
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .orderBy('files.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...file],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getTotalFileCount(): Promise<number> {
    return this.fileRepository.count({where: {
      deletedAt: null
    }});
  }

  public async createFile(
    files: Express.Multer.File[],
    options: FileOptionsDTO,
  ): Promise<FileEntity[]> {
    try {
      const filesToReturn: FileEntity[] = [];
      if (files.length > 0) {
        for (const iterator of files) {
          // Por convenio el id de la categoria a la que va a pertencer el archivo viene en el propio nombre del archivo
          // obtenemos dicho id para asociarlo a la entidad File
          const idCategory = iterator.originalname ? iterator.originalname.split('#')[0] : null;
          const originalName = iterator.originalname ? iterator.originalname.split('#')[1].split('.')[0] : null;

          let objCategory: FileCategoryEntity = null;
          if (idCategory) {
            objCategory = await this.fileCategory.findFileCategoryById(
              idCategory?.split('.')[0],
            );
          }
          const objFile = new FileEntity();

          // Generar un nombre único para la imagen
          const uniqueFileName = uuidv4();

          // Obtener la ruta de la carpeta para almacenar la imagen
          const uploadPath = options.moduleName
            ? `uploads/files/${options.moduleName}/`
            : `uploads/files/`;
          const uploadPathToSave = options.moduleName
            ? `files/${options.moduleName}/`
            : `files/`;

          // Construir la ruta completa del archivo
          const filePath = path.join(
            uploadPath,
            `${uniqueFileName}${path.extname(iterator.originalname)}`,
          );

          // Mover el archivo al directorio correspondiente
          await fs.mkdir(uploadPath, { recursive: true });
          const fileBuffer = iterator.buffer;

          await fs.writeFile(filePath, fileBuffer);

          // Actualizar el campo de imagen en el la entiad file
          objFile.fileUrl = `${uploadPathToSave}${uniqueFileName}${path.extname(
            iterator.originalname,
          )}`;
          objFile.fileType = iterator.mimetype;
          objFile.fileCategory = objCategory || null;
          objFile[options.relationshipName] = options.valueRelationship;
          objFile.originalName = originalName || ''

          // Guardar los cambios en la base de datos
          const fileCreted = await this.fileRepository.save(objFile);
          filesToReturn.push(fileCreted);
        }
      }
      return filesToReturn;
    } catch (error) {
      console.log(error);
      console.log(error);

      throw new Error(error);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof FileKeyToSearchDTO | any; // Aqui se pueden ir agregado todos los DTOs de las entidades que tengan la relacion con Files
    value: any;
  }) {
    try {
      const files = await this.fileRepository
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.fileCategory', 'fileCategory')
        .where({ [key]: value })
        .getMany();

      return files;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findByEntityId(id: string, entity: FILE_ENTITY_NAMES) {
    try {
      const files = await this.fileRepository
        .createQueryBuilder('file')
        .leftJoinAndSelect('file.fileCategory', 'fileCategory')
        .leftJoinAndSelect(`file.${entity}`, `${entity}`)
        .where(`${entity}.id = :id`, { id: id })
        .getMany();

      return files;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteFile(
    options: FileOptionsToDeleteDTO,
  ): Promise<DeleteResult | undefined> {
    try {
      if (options.relationshipName && options.valueRelationship) {
        //Se obtienen los archivos dado el nombre y el value de las relaciones dinamicas
        const listOfFiles = await this.findBy({
          key: options.relationshipName,
          value: options.valueRelationship,
        });

        //Obtengo la lista de id de los archivos obtenidos para ser eliminados
        const fileIds = listOfFiles.map((file) => file.id);

        //Obtengo la lista de ruta de los archivos para que puedan ser eliminados fisicamente
        const fileUrls = listOfFiles.map((file) => file.fileUrl);

        if (fileIds.length > 0) {
          //Eliminando los registros de la base de datos
          const File: DeleteResult = await this.fileRepository.softDelete(
            fileIds,
          );
          if (File.affected === 0) {
            throw new ErrorManager({
              type: 'BAD_REQUEST',
              message: 'No se pudo eliminar el registro',
            });
          }
          // Eliminando los archivos
          for (const url of fileUrls) {
            await fs.unlink('uploads/' + url);
          }
          return File;
        }
      }
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteAndCreateFile(
    files: Express.Multer.File[],
    options: FileOptionsDTO,
  ): Promise<void> {
    try {
      //1. Eliminamos los archivos antiguos
      await this.deleteFile(options);

      //2. Creamos los nuevos archivos
      await this.createFile(files, options);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteFileById(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const objToDelete = await this.findBy({key: 'id', value: id})
      const fileToDeleted: DeleteResult =
      await this.fileRepository.softDelete(id);
      if (fileToDeleted.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      if (objToDelete.length > 0) await fs.unlink('uploads/' + objToDelete[0].fileUrl);
      return fileToDeleted;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getFilesCountByCategory(categoryId?: string): Promise<{ category: string; count: number }[]> {
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
    .where('file.deleted_at IS NULL')
      .leftJoin('file.fileCategory', 'category')
      .select('COALESCE(category.name, :defaultCategory)', 'category') // Utilizar COALESCE para mostrar "Sin Categoría"
      .addSelect('COUNT(file.id)', 'count')
      .setParameter('defaultCategory', 'Sin Categoría'); // Valor predeterminado para los archivos sin categoría


    if (categoryId) {
      queryBuilder.where('file.fileCategory.id = :categoryId', { categoryId });
    }

    queryBuilder.groupBy('category.name'); // Agregar 'category.name' en el GROUP BY

    const filesCount = await queryBuilder.getRawMany();
    return filesCount;
  }
}
