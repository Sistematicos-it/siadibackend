import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConectivityEntity } from './entities/conectivity.entity';
import { ConectivityService } from './services/conectivity.service';
import { ConectivityController } from './controllers/conectivity.controller';
import { FileService } from 'src/modules/file/services/file.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConectivityEntity])],
  providers: [ConectivityService, FileService],
  controllers: [ConectivityController],
  exports: [ConectivityService, FileService, TypeOrmModule],
})
export class ConectivitysModule {}
