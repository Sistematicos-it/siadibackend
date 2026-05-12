import { Injectable } from '@nestjs/common';
import { RoleDTO, RoleResultDTO } from '../dto/role.dto';
import { RoleEntity } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils';
import { ROLES } from 'src/constants';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}
  public async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<RoleResultDTO> {
    try {
      const queryBuilder = this.roleRepository.createQueryBuilder('roles');
      const pageNumber = page ? page : 1;
      const pageLimit = limit ? limit : 10;

      const [roles, totalElements] = await queryBuilder
        .orderBy('roles.updatedAt', 'DESC')
        .skip((pageNumber - 1) * pageLimit)
        .take(pageLimit)
        .getManyAndCount();

      const totalPages = Math.ceil(totalElements / pageLimit);

      return {
        pageNumber,
        pageLimit,
        totalElements,
        totalPages,
        data: [...roles],
      };
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOne(id: string): Promise<RoleEntity> {
    try {
      const role: RoleEntity = await this.roleRepository
        .createQueryBuilder('roles')
        .where({ id })
        .getOne();

      return role;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof RoleDTO; value: any }) {
    try {
      const Role = await this.roleRepository
        .createQueryBuilder('roles')
        .where({ [key]: value })

        .getOne();

      return Role;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
