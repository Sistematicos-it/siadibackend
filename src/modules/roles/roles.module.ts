import { Module, Global } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { UsersService } from '../users/services/users.service';
import { DatabaseSeederRolesService } from './services/databaseSeederRoles.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  providers: [RolesService, DatabaseSeederRolesService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule, DatabaseSeederRolesService]
})
export class RolesModule {}
