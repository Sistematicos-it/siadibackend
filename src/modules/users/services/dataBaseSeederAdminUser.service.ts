import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity';
import { ROLES } from 'src/constants';
import { UsersService } from './users.service';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';

@Injectable()
export class DatabaseSeederAdminUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UsersService,
  ) {}

  async seedAdminUser(AdminRole: RoleEntity) {
    // Creando el admin
    const userExistsAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    if (!userExistsAdmin) {
      const admin = new UserEntity();
      admin.username = 'admin';
      admin.email = 'admin@gmail.com';
      admin.password = 'Admin123*';
      admin.role = AdminRole;
      await this.userService.createUser(admin);
    } else {
      if (!userExistsAdmin?.role) {
        userExistsAdmin.role = AdminRole;
        await this.userRepository.update(userExistsAdmin?.id, userExistsAdmin);
      }
    }
  }
}
