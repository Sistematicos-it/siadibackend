import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCatalogEntity } from './entities/course-catalog.entity';
import { CourseCatalogService } from './services/course-catalog.service';
import { CourseCatalogController } from './controllers/course-catalog.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([
    CourseCatalogEntity,
  ])],
  providers: [
    CourseCatalogService,
  ],
  controllers: [
    CourseCatalogController,
  ],
  exports: [
    CourseCatalogService,
    TypeOrmModule
  ],
})
export class CourseCatalogModule {}
