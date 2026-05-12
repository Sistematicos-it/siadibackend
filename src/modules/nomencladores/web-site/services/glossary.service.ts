import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlossaryEntity } from '../entities/glossary.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  GlossaryDTO,
  GlossaryResultDTO,
  GlossaryUpdateDTO,
} from '../dto/glossary.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GlossaryService {
  constructor(
    @InjectRepository(GlossaryEntity)
    private readonly glossaryRepository: Repository<GlossaryEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.glossaryRepository.createQueryBuilder('glossary');

    query = query.where('glossary.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('glossary.id != :excludeId', { excludeId });
    }
    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createGlossary(
    body: GlossaryDTO,
    image: Express.Multer.File
  ): Promise<GlossaryEntity> {
    try {
     

    // Guardar los datos del glosario en la base de datos
    const createdGlossary = await this.glossaryRepository.save(body);

    if (image) {
      // Generar un nombre único para la imagen
      const uniqueFileName = uuidv4();

      // Obtener la ruta de la carpeta para almacenar la imagen
      const uploadPath = 'uploads/glossary/';

      // Construir la ruta completa del archivo
      const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(image.originalname)}`);

      // Mover el archivo al directorio correspondiente
      await fs.mkdir(uploadPath, { recursive: true });
      const fileBuffer = image.buffer;

      await fs.writeFile(filePath, fileBuffer);

      // Actualizar el campo de imagen en el glosario
      createdGlossary.image = `glossary/${uniqueFileName}${path.extname(image.originalname)}`;

      // Guardar los cambios en la base de datos
      await this.glossaryRepository.save(createdGlossary);
    }
    return createdGlossary
    } catch (error) {
      console.log(error);
      console.log(error);
      
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async findGlossary(
    page: number,
    limit: number,
    search: string,
  ): Promise<GlossaryResultDTO> {
    try {
      const queryBuilder =
        this.glossaryRepository.createQueryBuilder('glossary');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('glossary.name ILIKE :search OR glossary.description ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Glossary, totalElements] = await queryBuilder
        .orderBy('glossary.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Glossary],
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
    key: keyof GlossaryDTO;
    value: any;
  }) {
    try {
      const Glossary =
        await this.glossaryRepository.createQueryBuilder('glossary')
          .where({ [key]: value })
          .getOne();

      return Glossary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findGlossaryById(
    id: string,
  ): Promise<GlossaryEntity> {
    try {
      const Glossary: GlossaryEntity =
        await this.glossaryRepository.createQueryBuilder('glossary')
          .where({ id })
          .getOne();
      return Glossary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateGlossary(
    id: string,
    body: GlossaryUpdateDTO,
    image: Express.Multer.File,
  ): Promise<UpdateResult | undefined> {
    try {
      const glossaryToUpdate =
        await this.glossaryRepository.findOneBy({ id });

      if (!glossaryToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Especializacion',
        });
      }
      const updateData: Partial<GlossaryEntity> = {
        name: body.name,
        description: body.description
      };
      if (image) {
        // Guardamos la referencia de la imagen anterior, porque despues que se actualice, la vamos a eliminar
        // de lo contrario no la eliminamos para que se quede la referencia
        const oldImage = glossaryToUpdate.image

          // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/glossary/';

        // Construir la ruta completa del archivo
        const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(image.originalname)}`);

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = image.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el glosario
        updateData.image = `glossary/${uniqueFileName}${path.extname(image.originalname)}`;

        const objUpdated = await this.glossaryRepository.update(id, updateData)

        if (objUpdated.affected === 1) {
          console.log('%cglossary.service.ts line:189 oldImage', 'color: #007acc;', oldImage);
          await fs.unlink(`uploads/${oldImage}`)
        }
        return objUpdated
      }
      return await this.glossaryRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      console.log('%cglossary.service.ts line:195 error', 'color: #007acc;', error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteGlossary(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const glossaryToDeleted =
        await this.glossaryRepository.findOneBy({ id });
      const oldImage = glossaryToDeleted.image
      const glossary: DeleteResult =
        await this.glossaryRepository.softDelete(id);
      if (glossary.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      await fs.unlink(`uploads/${oldImage}`).catch(err=>{
        console.log('%cglossary.service.ts line:217 err', 'color: #007acc;', err);

        return null
      })
      return glossary;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
