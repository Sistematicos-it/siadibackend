import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentEntity } from './entities/incident.entity';
import { IncidentService } from './services/incident.service';
import { IncidentController } from './controllers/incident.controller';
import { IncidentAssetsEntity } from './entities/incident-assets.entity';
import { IncidentLogsEntity } from './entities/incident-logs.entity';
import { DisconnectionIncidentEntity } from './entities/disconnection-incident.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentEntity,
      IncidentAssetsEntity,
      IncidentLogsEntity,
      DisconnectionIncidentEntity,
    ]),
  ],
  providers: [IncidentService],
  controllers: [IncidentController],
  exports: [IncidentService, TypeOrmModule],
})
export class IncidentsModule {}
