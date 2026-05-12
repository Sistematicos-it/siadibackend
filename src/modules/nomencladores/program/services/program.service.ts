import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProgramEntity } from '../entities/program.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  ProgramDTO,
  ProgramResultDTO,
  ProgramUpdateDTO,
} from '../dto/program.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { CertificateService } from '../../certifcate/services/certificate.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FileService } from 'src/modules/file/services/file.service';
import { MODULES_NAMES } from 'src/constants/enums';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Request } from 'express';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { ROLES } from 'src/constants';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { differenceInYears } from 'date-fns';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(ProgramEntity)
    private readonly ProgramRepository: Repository<ProgramEntity>,
    private readonly citizenService: CitizenService,
    private readonly CertificateService: CertificateService,
    private readonly fileService: FileService,
    private readonly SecurityService: SecurityService,
  ) {}

  public async createProgram(
    body: ProgramDTO,
    files: Express.Multer.File[],
    coverImage: Express.Multer.File,
    user_id: string,
    ip: string,
  ): Promise<ProgramEntity> {
    try {
      const objProgram = new ProgramEntity();
      objProgram.name = body.name;
      objProgram.content = body.content;
      objProgram.hours = body.hours;
      objProgram.min_age = body.min_age;
      objProgram.max_age = body.max_age;
      objProgram.url = body.url;

      if (body.certificate) {
        const certificate = await this.CertificateService.findCertificateById(
          body.certificate,
        );

        objProgram.certificate = certificate;
      }

      if (coverImage) {
        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/files/program/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(coverImage.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = coverImage.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el service
        objProgram.coverImage = `files/program/${uniqueFileName}${path.extname(
          coverImage.originalname,
        )}`;
      }

      const objSaved = await this.ProgramRepository.save(objProgram);

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.PROGRAM,
          relationshipName: 'program',
          valueRelationship: objSaved.id,
        };
        this.fileService.createFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.CREATE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'program',
        entry_id: objSaved.id,
        ip,
      });

      return objSaved;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async addFiles(id: string, files: Express.Multer.File[]) {
    try {
      const program = await this.ProgramRepository.findOneBy({ id });

      if (!program) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el programe',
        });
      }

      const optionsFiles: FileOptionsDTO = {
        moduleName: 'program',
        relationshipName: 'program',
        valueRelationship: program.id,
      };
      this.fileService.createFile(files, optionsFiles);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProgram(
    page: number,
    limit: number,
    req: Request,
  ): Promise<ProgramResultDTO> {
    try {
      const queryBuilder = this.ProgramRepository.createQueryBuilder('program')
        .leftJoinAndSelect('program.certificate', 'certificate')
        .leftJoinAndSelect('program.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory');
      let query_string = '';

      const filters = req.query;

      const keys = Object.keys(filters);

      const values = Object.values(filters);

      let realIndex = 0;
      keys.forEach((key, i) => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
          query_string = query_string.concat(
            `${realIndex !== 0 ? ' AND ' : ''}${
              key.split('.').length > 1 ? key : `program.${key}`
            }='${values[i]}'`,
          );
          realIndex++;
        }
      });

      if (req.query.search) {
        query_string = query_string.concat(
          `${query_string ? ' AND ' : ''} program.name ILIKE '%${
            req.query.search
          }%' OR program.content ILIKE '%${req.query.search}%'`,
        );
      }

      if (query_string) {
        queryBuilder.where(query_string);
      }
      if (req?.roleUser === ROLES.CITIZEN) {
        const citizen = await this.citizenService.findByUserId(req?.idUser);

        queryBuilder.andWhere(
          'program.min_age <= :age AND program.max_age >= :age',
          { age: differenceInYears(new Date(), new Date(citizen?.birth_date)) },
        );

        console.log(differenceInYears(new Date(), new Date(citizen?.birth_date)));
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Program, totalElements] = await queryBuilder

        .orderBy('program.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Program],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof ProgramDTO; value: any }) {
    try {
      const Program = await this.ProgramRepository.createQueryBuilder('program')
        .where({ [key]: value })
        .leftJoinAndSelect('program.certificate', 'certificate')
        .leftJoinAndSelect('program.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .getOne();

      return Program;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findProgramById(id: string): Promise<ProgramEntity> {
    try {
      const Program: ProgramEntity =
        await this.ProgramRepository.createQueryBuilder('program')
          .where({ id })
          .leftJoinAndSelect('program.certificate', 'certificate')
          .leftJoinAndSelect('program.files', 'files')
          .leftJoinAndSelect('files.fileCategory', 'fileCategory')
          .getOne();
      return Program;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async filterProgramByCertificate(
    page: number,
    limit: number,
    id: string,
  ): Promise<ProgramResultDTO> {
    try {
      const queryBuilder = this.ProgramRepository.createQueryBuilder('program');

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [Program, totalElements] = await queryBuilder

        .leftJoinAndSelect('program.certificate', 'certificate')
        .where('certificate.id = :id', { id: id })
        .orderBy('program.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...Program],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProgram(
    id: string,
    body: ProgramUpdateDTO,
    files: Express.Multer.File[],
    coverImage: Express.Multer.File,
    user_id: string,
    ip: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const ProgramToUpdate = await this.ProgramRepository.findOneBy({
        id,
      });

      if (!ProgramToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la programa',
        });
      }
      const updateData: Partial<ProgramEntity> = {
        name: body.name,
        content: body.content,
        hours: body.hours,
        min_age: body.min_age,
        max_age: body.max_age,
        url: body.url,
      };

      if (body.certificate) {
        const certificate = await this.CertificateService.findCertificateById(
          body.certificate,
        );

        updateData.certificate = certificate;
      }
      if (coverImage) {
        // Generar un nombre único para la imagen
        const uniqueFileName = uuidv4();

        // Obtener la ruta de la carpeta para almacenar la imagen
        const uploadPath = 'uploads/files/program/';

        // Construir la ruta completa del archivo
        const filePath = path.join(
          uploadPath,
          `${uniqueFileName}${path.extname(coverImage.originalname)}`,
        );

        // Mover el archivo al directorio correspondiente
        await fs.mkdir(uploadPath, { recursive: true });
        const fileBuffer = coverImage.buffer;

        await fs.writeFile(filePath, fileBuffer);

        // Actualizar el campo de imagen en el service
        updateData.coverImage = `files/program/${uniqueFileName}${path.extname(
          coverImage.originalname,
        )}`;
      }

      const objUpdated = await this.ProgramRepository.update(id, updateData);
      if (objUpdated.affected > 0 && files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.PROGRAM,
          relationshipName: 'program',
          valueRelationship: ProgramToUpdate.id,
        };
        await this.fileService.deleteAndCreateFile(files, optionsFiles);
      }

      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.EDIT,
        made_on: new Date(),
        user_id: user_id,
        entity: 'program',
        entry_id: ProgramToUpdate.id,
        ip,
      });

      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteProgram(
    id: string,
    user_id: string,
    ip: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const Program: DeleteResult = await this.ProgramRepository.softDelete(id);
      if (Program.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      await this.SecurityService.createSecurity({
        action: SECURITY_ACTION.DELETE,
        made_on: new Date(),
        user_id: user_id,
        entity: 'program',
        entry_id: id,
        ip,
      });

      return Program;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
