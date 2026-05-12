import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PointStatusEntity } from './entities/point-status.entity';
import { PointStatusService } from './services/point-status.service';
import { PointStatusController } from './controllers/point-status.controller';
import { DatabaseSeederPointStatusService } from './services/databaseSeederPointStatus.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PointStatusEntity])],
  providers: [PointStatusService, DatabaseSeederPointStatusService],
  controllers: [PointStatusController],
  exports: [
    PointStatusService,
    DatabaseSeederPointStatusService,
    TypeOrmModule,
  ],
})
export class PointStatusModule {}
