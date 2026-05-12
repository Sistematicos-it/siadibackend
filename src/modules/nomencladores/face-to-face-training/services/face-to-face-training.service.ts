import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaceToFaceTrainingEntity } from '../entities/face-to-face-training.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  FaceToFaceTrainingDTO,
  FaceToFaceTrainingResultDTO,
  FaceToFaceTrainingUpdateDTO,
} from '../dto/face-to-face-training.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import { FileService } from 'src/modules/file/services/file.service';
import {
  FileOptionsDTO,
  FileOptionsToDeleteDTO,
} from 'src/modules/file/dto/file.dto';
import { FILE_ENTITY_NAMES, MODULES_NAMES } from 'src/constants/enums';

@Injectable()
export class FaceToFaceTrainingService {
  constructor(
    @InjectRepository(FaceToFaceTrainingEntity)
    private readonly FaceToFaceTrainingRepository: Repository<FaceToFaceTrainingEntity>,

    private readonly fileServices: FileService,
  ) {}

  public async createFaceToFaceTraining(
    body: FaceToFaceTrainingDTO,
    files: Express.Multer.File[],
  ): Promise<FaceToFaceTrainingEntity> {
    try {
      const createdFaceToFaceTraining =
        await this.FaceToFaceTrainingRepository.save(body);

      if (files) {
        const optionsFiles: FileOptionsDTO = {
          moduleName: MODULES_NAMES.FACETOFACETRAINING,
          relationshipName: 'training',
          valueRelationship: createdFaceToFaceTraining.id,
        };
        this.fileServices.createFile(files, optionsFiles);
      }
      return createdFaceToFaceTraining;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async addFaceToFaceTrainingFiles() {}

  public async findFaceToFaceTraining(
    page: number,
    limit: number,
    search: string,
  ): Promise<FaceToFaceTrainingResultDTO> {
    try {
      const queryBuilder = this.FaceToFaceTrainingRepository.createQueryBuilder(
        'face_to_face_training',
      );

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('face_to_face_training.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [FaceToFaceTraining, totalElements] = await queryBuilder
        .leftJoinAndSelect('face_to_face_training.files', 'files')
        .leftJoinAndSelect('files.fileCategory', 'fileCategory')
        .orderBy('face_to_face_training.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...FaceToFaceTraining],
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
    key: keyof FaceToFaceTrainingDTO;
    value: any;
  }) {
    try {
      const FaceToFaceTraining =
        await this.FaceToFaceTrainingRepository.createQueryBuilder(
          'face_to_face_training',
        )
          .where({ [key]: value })

          .getOne();

      const files = await this.fileServices.findByEntityId(
        FaceToFaceTraining.id,
        FILE_ENTITY_NAMES.FACETOFACETRAINING,
      );

      FaceToFaceTraining.files = files;
      return FaceToFaceTraining;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findFaceToFaceTrainingById(
    id: string,
  ): Promise<FaceToFaceTrainingEntity> {
    try {
      const FaceToFaceTraining: FaceToFaceTrainingEntity =
        await this.FaceToFaceTrainingRepository.createQueryBuilder(
          'face_to_face_training',
        )
          .where({ id })

          .getOne();

      const files = await this.fileServices.findByEntityId(
        FaceToFaceTraining.id,
        FILE_ENTITY_NAMES.FACETOFACETRAINING
      );

      FaceToFaceTraining.files = files;
      return FaceToFaceTraining;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateFaceToFaceTraining(
    id: string,
    body: FaceToFaceTrainingUpdateDTO,
    files: Express.Multer.File[],
  ): Promise<UpdateResult | undefined> {
    try {
      const FaceToFaceTrainingToUpdate =
        await this.FaceToFaceTrainingRepository.findOneBy({
          id,
        });

      if (!FaceToFaceTrainingToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar la capacitacion presencial',
        });
      }
      const objUpdated = await this.FaceToFaceTrainingRepository.update(
        id,
        body,
      );
      if (objUpdated.affected > 0 && files) {
        const options: FileOptionsDTO = {
          moduleName: MODULES_NAMES.FACETOFACETRAINING,
          relationshipName: 'training',
          valueRelationship: id,
        };
        await this.fileServices.deleteAndCreateFile(files, options);
      }
      return objUpdated;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteFaceToFaceTraining(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const options: FileOptionsToDeleteDTO = {
        relationshipName: 'training',
        valueRelationship: id,
      };
      await this.fileServices.deleteFile(options);
      const FaceToFaceTraining: DeleteResult =
        await this.FaceToFaceTrainingRepository.softDelete(id);
      if (FaceToFaceTraining.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return FaceToFaceTraining;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
