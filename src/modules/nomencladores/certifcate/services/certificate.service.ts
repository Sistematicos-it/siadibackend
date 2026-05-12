import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CertificateEntity } from '../entities/certificate.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import {
  CertificateDTO,
  CertificateResultDTO,
  CertificateUpdateDTO,
} from '../dto/certificate.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Request } from 'express';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly CertificateRepository: Repository<CertificateEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.CertificateRepository.createQueryBuilder('certificate');

    query = query.where('certificate.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('certificate.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createCertificate(
    body: CertificateDTO,
    file: Express.Multer.File,
  ): Promise<CertificateEntity> {
    try {
      const certificateObj = new CertificateEntity();
      certificateObj.name = body.name;

      if (file) {
        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/files/certificate/';
        const savePath = 'files/certificate/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(file.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = file.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el glosario
        certificateObj.file = `${savePath}${uniqueFileName}${path.extname(
          file.originalname,
        )}`;
      }

      const createdCertificate = await this.CertificateRepository.save(
        certificateObj,
      );

      return createdCertificate;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findCertificate(
    page: number,
    limit: number,
    req: Request,
  ): Promise<CertificateResultDTO> {
    try {
      const queryBuilder =
        this.CertificateRepository.createQueryBuilder('certificate');

      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);


      let realIndex = 0
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${key.split(".").length > 1 ? key: `certificate.${key}`}='${values[i]}'`,
          );
          realIndex++
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} certificate.name ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Certificate, totalElements] = await queryBuilder
        .orderBy('certificate.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Certificate],
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
    key: keyof CertificateDTO;
    value: any;
  }) {
    try {
      const Certificate = await this.CertificateRepository.createQueryBuilder(
        'certificate',
      )
        .where({ [key]: value })
        .getOne();

      return Certificate;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCertificateById(id: string): Promise<CertificateEntity> {
    try {
      const Certificate: CertificateEntity =
        await this.CertificateRepository.createQueryBuilder('certificate')
          .where({ id })
          .getOne();
      return Certificate;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCertificate(
    id: string,
    body: CertificateUpdateDTO,
    image: Express.Multer.File,
  ): Promise<UpdateResult | undefined> {
    try {
      const CertificateToUpdate = await this.CertificateRepository.findOneBy({
        id,
      });

      if (!CertificateToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la certificado',
        });
      }

      const updatedData: Partial<CertificateEntity> = {
        name: body.name,
      };

      if (image) {
        // Guardamos la referencia de la imagen anterior, porque despues que se actualice, la vamos a eliminar
        // de lo contrario no la eliminamos para que se quede la referencia
        const oldImage = CertificateToUpdate.file;

        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/files/certificate/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(image.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = image.buffer;

        await fs.writeFile(filePath, fileBuffer);

        const savePath = 'files/certificate/';

        // Actualizar el campo de imagen en el glosario
        updatedData.file = `${savePath}${uniqueFileName}${path.extname(
          image.originalname,
        )}`;

        const objUpdated = await this.CertificateRepository.update(
          id,
          updatedData,
        );

        if (objUpdated.affected === 1) {
          const unlinkPath = uploadPath + oldImage.split('/')[2];

          await fs.unlink(`${unlinkPath}`);
        }
        return objUpdated;
      }

      return await this.CertificateRepository.update(id, updatedData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCertificate(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Certificate: DeleteResult =
        await this.CertificateRepository.softDelete(id);
      if (Certificate.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return Certificate;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
