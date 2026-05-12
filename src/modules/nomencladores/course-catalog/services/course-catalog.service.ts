import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseCatalogEntity } from '../entities/course-catalog.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  CourseCatalogDTO,
  CourseCatalogResultDTO,
  CourseCatalogUpdateDTO,
} from '../dto/course-catalog.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CourseCatalogService {
  constructor(
    @InjectRepository(CourseCatalogEntity)
    private readonly CourseCatalogRepository: Repository<CourseCatalogEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.CourseCatalogRepository.createQueryBuilder('course-catalog');

    query = query.where('course-catalog.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('course-catalog.id != :excludeId', { excludeId });
    }
    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createCourseCatalog(
    body: CourseCatalogDTO,
    image?: Express.Multer.File
  ): Promise<CourseCatalogEntity> {
    try {
     

    // Guardar los datos del Curso en la base de datos
    const createdCourseCatalog = await this.CourseCatalogRepository.save(body);

    if (image) {
      // Generar un nombre único para la imagen
      const uniqueFileName = uuidv4();

      // Obtener la ruta de la carpeta para almacenar la imagen
      const uploadPath = 'uploads/CourseCatalog/';

      // Construir la ruta completa del archivo
      const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(image.originalname)}`);

      // Mover el archivo al directorio correspondiente
      await fs.mkdir(uploadPath, { recursive: true });
      const fileBuffer = image.buffer;

      await fs.writeFile(filePath, fileBuffer);

      // Actualizar el campo de imagen en el Curso
      createdCourseCatalog.image = `course-catalog/${uniqueFileName}${path.extname(image.originalname)}`;

      // Guardar los cambios en la base de datos
      await this.CourseCatalogRepository.save(createdCourseCatalog);
    }
    return createdCourseCatalog
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async findCourseCatalog(
    page: number,
    limit: number,
    search: string,
  ): Promise<CourseCatalogResultDTO> {
    try {
      const queryBuilder =
        this.CourseCatalogRepository.createQueryBuilder('course-catalog');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('course-catalog.name ILIKE :search OR course-catalog.description ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [CourseCatalog, totalElements] = await queryBuilder
        .orderBy('course-catalog.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...CourseCatalog],
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
    key: keyof CourseCatalogDTO;
    value: any;
  }) {
    try {
      const CourseCatalog =
        await this.CourseCatalogRepository.createQueryBuilder('course-catalog')
          .where({ [key]: value })
          .getOne();

      return CourseCatalog;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCourseCatalogById(
    id: string,
  ): Promise<CourseCatalogEntity> {
    try {
      const CourseCatalog: CourseCatalogEntity =
        await this.CourseCatalogRepository.createQueryBuilder('course-catalog')
          .where({ id })
          .getOne();
      return CourseCatalog;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCourseCatalog(
    id: string,
    body: CourseCatalogUpdateDTO,
    image: Express.Multer.File,
  ): Promise<UpdateResult | undefined> {
    try {
      const CourseCatalogToUpdate =
        await this.CourseCatalogRepository.findOneBy({ id });

      if (!CourseCatalogToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Especializacion',
        });
      }
      const updateData: Partial<CourseCatalogEntity> = {
        name: body.name,
        description: body.description
      };
      if (image) {
        // Guardamos la referencia de la imagen anterior, porque despues que se actualice, la vamos a eliminar
        // de lo contrario no la eliminamos para que se quede la referencia
        const oldImage = CourseCatalogToUpdate.image

          // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/course-catalog/';

        // Construir la ruta completa del archivo
        const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(image.originalname)}`);

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = image.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el Curso
        updateData.image = `course-catalog/${uniqueFileName}${path.extname(image.originalname)}`;

        const objUpdated = await this.CourseCatalogRepository.update(id, updateData)

        if (objUpdated.affected === 1) {
          console.log('%ccourse-catalog.service.ts line:189 oldImage', 'color: #007acc;', oldImage);
          await fs.unlink(`uploads/${oldImage}`)
        }
        return objUpdated
      }
      return await this.CourseCatalogRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      console.log('%ccourse-catalog.service.ts line:195 error', 'color: #007acc;', error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCourseCatalog(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const CourseCatalogToDeleted =
        await this.CourseCatalogRepository.findOneBy({ id });
      const oldImage = CourseCatalogToDeleted.image
      const CourseCatalog: DeleteResult =
        await this.CourseCatalogRepository.softDelete(id);
      if (CourseCatalog.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      await fs.unlink(`uploads/${oldImage}`).catch(err=>{
        console.log('%ccourse-catalog.service.ts line:217 err', 'color: #007acc;', err);

        return null
      })
      return CourseCatalog;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
