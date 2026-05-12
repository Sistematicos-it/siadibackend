import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginReasonOfVisitEntity } from '../entities/login-reason-visit.entity';
import { DeleteResult, ILike, Not, Repository, UpdateResult } from 'typeorm';
import { ErrorManager } from '../../../utils/error.manager';
import slugify from 'slugify';
import { LoginReasonOfVisitDTO, LoginReasonOfVisitResultDTO, LoginReasonOfVisitUpdateDTO } from '../dto/login-reason-visit.dto';

@Injectable()
export class LoginReasonOfVisitService {
  constructor(
    @InjectRepository(LoginReasonOfVisitEntity)
    private readonly loginReasonOfVisitRepository: Repository<LoginReasonOfVisitEntity>,
  ) {}

  async checkIfNameExists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.loginReasonOfVisitRepository.createQueryBuilder('loginReason');

    query = query.where('loginReason.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      query = query.andWhere('loginReason.id != :excludeId', { excludeId });
    }

    const existingItem = await query.getOne();
    
    return !!existingItem;
  }

  public async createLoginReasonOfVisit(
    body: LoginReasonOfVisitDTO,
  ): Promise<LoginReasonOfVisitEntity> {
    try {
      const objLoginReasonOfVisit = new LoginReasonOfVisitEntity();
      objLoginReasonOfVisit.name = body.name;
      objLoginReasonOfVisit.slug = slugify(body.name, {lower: true});
      return await this.loginReasonOfVisitRepository.save(objLoginReasonOfVisit);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async updateLoginReasonOfVisit(
    id: string,
    body: LoginReasonOfVisitUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const LoginReasonOfVisitToUpdate =
        await this.loginReasonOfVisitRepository.findOneBy({ id });

      if (!LoginReasonOfVisitToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo encontrar el Archivo de la Categoria',
        });
      }
      const updateData: Partial<LoginReasonOfVisitEntity> = {
        name: body.name,
        slug: slugify(body.name, {lower: true})
      };
      return await this.loginReasonOfVisitRepository.update(id, updateData);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findlistLoginReasonVisit(
    page: number,
    limit: number,
    search: string,
  ): Promise<LoginReasonOfVisitResultDTO> {
    try {
      const queryBuilder =
        this.loginReasonOfVisitRepository.createQueryBuilder('login_reason_visit');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('login_reason_visit.name ILIKE :search OR login_reason_visit.slug ILIKE :search', {
          search: `%${slugify(search, { lower: true })}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [listLoginReasonVisit, totalElements] = await queryBuilder
        .orderBy('login_reason_visit.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...listLoginReasonVisit],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findLoginReasonOfVisit(
    page: number,
    limit: number,
    search: string,
  ) {
    try {
      const queryBuilder =
        this.loginReasonOfVisitRepository.createQueryBuilder('login_reason_visit');

      // Agregar filtros de búsqueda
      if (search) {
        queryBuilder.where('login_reason_visit.name ILIKE :search OR login_reason_visit.slug ILIKE :search', {
          search: `%${slugify(search, { lower: true })}%`,
        });
      }

      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;
      const [loginReasonVisit, totalElements] = await queryBuilder
        .orderBy('login_reason_visit.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();
      const totalPages = Math.ceil(totalElements / pageLimit);
      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...loginReasonVisit],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof LoginReasonOfVisitDTO; value: any }) {
    try {
      const LoginReasonOfVisit = await this.loginReasonOfVisitRepository.createQueryBuilder(
        'login_reason_visit',
      )
        .where({ [key]: value })

        .getOne();

      return LoginReasonOfVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findLoginReasonOfVisitById(id: string): Promise<LoginReasonOfVisitEntity> {
    try {
      const LoginReasonOfVisit: LoginReasonOfVisitEntity =
        await this.loginReasonOfVisitRepository.createQueryBuilder('login_reason_visit')
          .where({ id })
          .getOne();
      return LoginReasonOfVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteLoginReasonOfVisit(
    id: string,
  ): Promise<DeleteResult | undefined> {
    try {
      const LoginReasonOfVisit: DeleteResult =
        await this.loginReasonOfVisitRepository.softDelete(id);
      if (LoginReasonOfVisit.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return LoginReasonOfVisit;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
