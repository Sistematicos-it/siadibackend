import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalTitleEntity } from './entities/professional-title.entity';
import { ProfessionalTitleService } from './services/professional-title.service';
import { ProfessionalTitleController } from './controllers/professional-title.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalTitleEntity])],
  providers: [ProfessionalTitleService],
  controllers: [ProfessionalTitleController],
  exports: [ProfessionalTitleService, TypeOrmModule],
})
export class ProfessionalTitleModule {}
