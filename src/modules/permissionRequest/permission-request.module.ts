import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRequestEntity } from './entities/permission-request.entity';
import { PermissionRequestService } from './services/permission-request.service';
import { PermissionRequestController } from './controllers/permission-request.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PermissionRequestEntity])],
  providers: [PermissionRequestService],
  controllers: [PermissionRequestController],
  exports: [PermissionRequestService, TypeOrmModule],
})
export class PermissionRequestModule {}
