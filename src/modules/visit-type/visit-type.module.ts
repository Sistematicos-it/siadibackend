import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitTypeEntity } from './entities/visit-type.entity';
import { VisitTypeService } from './services/visit-type.service';
import { VisitTypeController } from './controllers/visit-type.controller';
import { DatabaseSeederVisitTypeService } from './services/visit-type.seeder.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([VisitTypeEntity])],
  providers: [VisitTypeService, DatabaseSeederVisitTypeService],
  controllers: [VisitTypeController],
  exports: [VisitTypeService, TypeOrmModule, DatabaseSeederVisitTypeService],
})
export class VisitTypeModule {}
