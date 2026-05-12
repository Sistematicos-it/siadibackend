import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitRecordEntity } from './entities/visit-record.entity';
import { VisitRecordService } from './services/visit-record.service';
import { VisitRecordController } from './controllers/visit-record.controller';
import { CitizenVulneraabilityVisitsEntity } from './entities/citizen-visits-by-vulnerability.entity';


@Global()
@Module({
  imports: [TypeOrmModule.forFeature([VisitRecordEntity, CitizenVulneraabilityVisitsEntity])],
  providers: [VisitRecordService],
  controllers: [VisitRecordController],
  exports: [VisitRecordService, TypeOrmModule],
})
export class VisitRecordModule {}
