import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ReasonForVisitEntity } from './entities/reason-for-visit.entity';
import { ReasonForVisitService } from './services/reason-for-visit.service';
import { ReasonForVisitController } from './controllers/reason-for-visit.controller';
import { GlossaryEntity } from './entities/glossary.entity';
import { GlossaryService } from './services/glossary.service';
import { GlossaryController } from './controllers/glossary.controller';
import { ServiceEntity } from './entities/service.entity';
import { ServiceService } from './services/service.service';
import { ServiceController } from './controllers/service.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([
    ReasonForVisitEntity,
    GlossaryEntity,
    ServiceEntity
  ])],
  providers: [
    ReasonForVisitService,
    GlossaryService,
    ServiceService
  ],
  controllers: [
    ReasonForVisitController,
    GlossaryController,
    ServiceController,
  ],
  exports: [
    ReasonForVisitService,
    GlossaryService,
    ServiceService,
    TypeOrmModule
  ],
})
export class WebSiteModule {}
