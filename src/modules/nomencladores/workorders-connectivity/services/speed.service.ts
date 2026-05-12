import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpeedEntity } from '../entities/speed.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SpeedDTO, SpeedResultDTO, SpeedUpdateDTO } from '../dto/speed.dto';
import { ErrorManager } from '../../../../utils/error.manager';
import slugify from 'slugify';

@Injectable()
export class SpeedService {
  constructor(
    @InjectRepository(SpeedEntity)
    private readonly speedRepository: Repository<SpeedEntity>,
  ) {}

  public async createSpeed(body: SpeedDTO): Promise<SpeedEntity> {
    try {
      const objSpeed = new SpeedEntity()
      objSpeed.name = body.name
      objSpeed.download = body.download
      objSpeed.upFile = body.upFile
      objSpeed.slug = slugify(body.name, { lower: true });
      return await this.speedRepository.save(objSpeed);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findSpeed(
    page: number,
    limit: number,
    search: string,
  ): Promise<SpeedResultDTO> {
    try {
      const queryBuilder = this.speedRepository.createQueryBuilder('speed');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where(
          'speed.slug ILIKE :search',
          {
            search: `%${slugify(search, { lower: true })}%`,
          },
        );
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [speed, totalElements] = await queryBuilder
        .orderBy('speed.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);
      return { 
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...speed]
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof SpeedDTO; value: any }) {
    try {
      const speed = await this.speedRepository
        .createQueryBuilder('speed')
        .where({ [key]: value })
        .getOne();

      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSpeedById(id: string): Promise<SpeedEntity> {
    try {
      const speed: SpeedEntity = await this.speedRepository
        .createQueryBuilder('speed')
        .where({ id })
        // .leftJoinAndSelect('person.address', 'address')
        .getOne();
      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateSpeed(
    id: string,
    body: SpeedUpdateDTO,
  ): Promise<UpdateResult> {
    const speedToUpdate = await this.findSpeedById(id);
  
    if (!speedToUpdate) {
      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No se pudo encontrar el país',
      });
    }
  
    const updateData: Partial<SpeedEntity> = {
      name: body.name,
      download: body.download,
      upFile: body.upFile,
      slug: slugify(body.name, { lower: true })
    };
  
    return this.speedRepository.update(id, updateData);
  }

  public async deleteSpeed(id: string): Promise<DeleteResult | undefined> {
    try {
      const speed: DeleteResult = await this.speedRepository.softDelete(id);
      if (speed.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return speed;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
