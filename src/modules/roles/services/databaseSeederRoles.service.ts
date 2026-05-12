import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { ROLES, ROLE_VALUES } from 'src/constants';
import { IRoles } from '../interfaces/role.interface';

@Injectable()
export class DatabaseSeederRolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    private readonly rolesService: RolesService,
  ) {}

  async seedRoles() {
    //Guardar Roles en la BD si aun no existen
    const [roleExists, roleAmount] = await this.rolesRepository.findAndCount();

    if (roleAmount === 0) {
      await this.rolesRepository.save(ROLE_VALUES);
    } else {
      let missing_roles: IRoles[] = [];

      ROLE_VALUES.forEach((cnst_role) => {
        if (
          !roleExists.find((role) => {
            return role.role_value === cnst_role.role_value;
          })
        ) {
          missing_roles.push(cnst_role);
        }
      });

      if (missing_roles.length > 0) {
        await this.rolesRepository.save(missing_roles);
      }
    }

    const adminRoleUid = await this.rolesRepository.findOne({
      where: {
        role_value: ROLES.ADMIN,
      },
    });

    return adminRoleUid;
  }
}
