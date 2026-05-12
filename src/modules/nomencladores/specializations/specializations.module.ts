import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecializationEntity } from './entities/specialization.entity';
import { SpecializationService } from './services/specializations.service';
import { SpecializationController } from './controllers/specializations.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SpecializationEntity])],
  providers: [SpecializationService],
  controllers: [SpecializationController],
  exports: [SpecializationService, TypeOrmModule],
})
export class SpecializationsModule {}
