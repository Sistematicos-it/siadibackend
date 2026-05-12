import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';
import { FileCategoryEntity } from './entities/file-category.entity';
import { FileCategoryService } from './services/file-category.service';
import { FileCategoryController } from './controllers/file-category.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, FileCategoryEntity])],
  providers: [FileService, FileCategoryService],
  controllers: [FileController, FileCategoryController],
  exports: [FileService, FileCategoryService, TypeOrmModule],
})
export class FilesModule {}
