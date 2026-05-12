import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentIssuesEntity } from './entities/incident-issues.entity';
import { IncidentIssuesService } from './services/incident-issues.service';
import { IncidentIssuesController } from './controllers/incident-issues.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([IncidentIssuesEntity])],
  providers: [IncidentIssuesService],
  controllers: [IncidentIssuesController],
  exports: [IncidentIssuesService, TypeOrmModule],
})
export class IncidentIssuessModule {}
