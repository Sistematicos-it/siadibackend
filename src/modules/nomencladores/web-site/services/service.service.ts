import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity } from '../entities/service.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  ServiceDTO,
  ServiceResultDTO,
  ServiceUpdateDTO,
} from '../dto/service.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ReasonForVisitService } from './reason-for-visit.service';
import { FiltersServiceEntity } from '../interfaces/website.interface';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,

    private readonly reasonService: ReasonForVisitService,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.serviceRepository.createQueryBuilder('service');

    query = query.where('service.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('service.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  async saveImage(file: Express.Multer.File, folder: string): Promise<string | undefined> {
    if (!file) {
      return undefined;
    }

    const uniqueFileName = uuidv4();
    const uploadPath = `uploads/${folder}`;
    const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(file.originalname)}`);
    const fileBuffer = file.buffer;

    await fs.mkdir(uploadPath, { recursive: true });
    await fs.writeFile(filePath, fileBuffer);

    return `${folder}/${uniqueFileName}${path.extname(file.originalname)}`;
  }

  async createService(
    body: ServiceDTO,
    image: Express.Multer.File,
    coverImage: Express.Multer.File,
  ): Promise<ServiceEntity> {
    try {
      const objReasonForVisit = await this.reasonService.findReasonForVisitById(body.categorie);

      const service = new ServiceEntity();
      service.name = body.name;
      service.url = body.url;
      service.description = body.description;
      service.categorie = objReasonForVisit;

      const imagePromise = this.saveImage(image, 'service');
      const coverImagePromise = this.saveImage(coverImage, 'service');

      const [savedImage, savedCoverImage] = await Promise.all([imagePromise, coverImagePromise]);

      if (savedImage) {
        service.image = savedImage;
      }
      if (savedCoverImage) {
        service.coverImage = savedCoverImage;
      }

      const createdService = await this.serviceRepository.save(service);
      return createdService;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  public async findService(
    page: number,
    limit: number,
    search: string,
    filters: FiltersServiceEntity,
  ): Promise<ServiceResultDTO> {
    try {
      const queryBuilder =
        this.serviceRepository.createQueryBuilder('service');

        if (filters.category) {
          queryBuilder
          .andWhere('service.categorie = :categorie', { categorie: filters.category });
        }
      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('service.name ILIKE :search OR service.description ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Service, totalElements] = await queryBuilder
        .leftJoinAndSelect('service.categorie', 'categorie')
        .orderBy('service.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Service],
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
    key: keyof ServiceDTO;
    value: any;
  }) {
    try {
      const Service =
        await this.serviceRepository.createQueryBuilder('service')
          .where({ [key]: value })
          .getOne();

      return Service;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findServiceById(
    id: string,
  ): Promise<ServiceEntity> {
    try {
      const Service: ServiceEntity =
        await this.serviceRepository.createQueryBuilder('service')
          .where({ id })
          .getOne();
      return Service;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateService(
    id: string,
    body: ServiceUpdateDTO,
    image: Express.Multer.File,
    coverImage: Express.Multer.File
  ): Promise<UpdateResult | undefined> {
    try {
      const serviceToUpdate =
        await this.serviceRepository.findOneBy({ id });
      const objReasonForVisit =
        await this.reasonService.findReasonForVisitById(body.categorie);

      if (!serviceToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la Especializacion',
        });
      }
      const updateData: Partial<ServiceEntity> = {
        name: body.name,
        description: body.description,
        url: body.url,
        categorie: objReasonForVisit
      };
      let oldImage = null
      if (image) {
        // Guardamos la referencia de la imagen anterior, porque despues que se actualice, la vamos a eliminar
        // de lo contrario no la eliminamos para que se quede la referencia
        oldImage = serviceToUpdate.image

          // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/service/';

        // Construir la ruta completa del archivo
        const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(image.originalname)}`);

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = image.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el glosario
        updateData.image = `service/${uniqueFileName}${path.extname(image.originalname)}`;

      }
      let oldCoverImage = null
      if (coverImage) {
        // Guardamos la referencia de la imagen anterior, porque despues que se actualice, la vamos a eliminar
        // de lo contrario no la eliminamos para que se quede la referencia
        oldCoverImage = serviceToUpdate.coverImage

          // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/service/';

        // Construir la ruta completa del archivo
        const filePath = path.join(uploadPath, `${uniqueFileName}${path.extname(coverImage.originalname)}`);

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = coverImage.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el glosario
        updateData.coverImage = `service/${uniqueFileName}${path.extname(coverImage.originalname)}`;

      }
      if (coverImage || image) {
        const objUpdated = await this.serviceRepository.update(id, updateData)
  
        if (objUpdated.affected === 1 && oldImage && image) {
          await fs.unlink(`uploads/${oldImage}`)
        }
        if (objUpdated.affected === 1 && oldCoverImage && coverImage) {
          await fs.unlink(`uploads/${oldCoverImage}`)
        }
        return objUpdated
      }
      return await this.serviceRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteService(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const serviceToDeleted =
        await this.serviceRepository.findOneBy({ id });
      const oldImage = serviceToDeleted.image
      const oldPosterImage = serviceToDeleted.coverImage
      const service: DeleteResult =
        await this.serviceRepository.softDelete(id);
      if (service.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      console.log(oldImage)
      await fs.unlink(`uploads/${oldImage}`).catch(e =>{console.log(e); return null})
      await fs.unlink(`uploads/${oldPosterImage}`).catch(e =>{console.log(e); return null})
      return service;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
