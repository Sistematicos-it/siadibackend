import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionEntity } from './entities/institution.entity';
import { InstitutionService } from './services/institution.service';
import { InstitutionController } from './controllers/institution.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
  providers: [InstitutionService],
  controllers: [InstitutionController],
  exports: [InstitutionService, TypeOrmModule],
})
export class InstitutionsModule {}
