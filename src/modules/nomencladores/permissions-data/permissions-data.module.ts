import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionTypeEntity } from './entities/permissions-types.entity';
import { PermissionTypeService } from './services/permissions-types.service';
import { PermissionTypeController } from './controllers/permissions-types.controller';

@Global() //Esto hace que este modulo sea de manera global en toda la aplicacion y no tenga que estar importandolo
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        PermissionTypeEntity
      ]
    )],
  providers: [
    PermissionTypeService
  ],
  controllers: [
    PermissionTypeController
  ],
  exports: [
    PermissionTypeService,
    TypeOrmModule
  ],
})
export class PermissionTypeModule {}
