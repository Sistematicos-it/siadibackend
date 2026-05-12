import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationLevelEntity } from './entities/education-level.entity';
import { EducationLevelService } from './services/education-level.service';
import { EducationLevelController } from './controllers/education-level.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EducationLevelEntity])],
  providers: [EducationLevelService],
  controllers: [EducationLevelController],
  exports: [EducationLevelService, TypeOrmModule],
})
export class EducationLevelModule {}
