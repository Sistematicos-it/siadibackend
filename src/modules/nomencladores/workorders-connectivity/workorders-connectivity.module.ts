import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechnologyController } from './controllers/technology.controller';
import { TechnologyEntity } from './entities/technology.entity';
import { TechnologyService } from './services/technology.service';
import { SharingEntity } from './entities/sharing.entity';
import { SharingService } from './services/sharing.service';
import { SharingController } from './controllers/sharing.controller';
import { SpeedEntity } from './entities/speed.entity';
import { SpeedService } from './services/speed.service';
import { SpeedController } from './controllers/speed.controller';
import { ServiceStatusEntity } from './entities/service-status.entity';
import { ServiceStatusController } from './controllers/service-status.controller';
import { ServiceStatusService } from './services/service-status.service';

@Global() //Esto hace que este modulo sea de manera global en toda la aplicacion y no tenga que estar importandolo
@Module({
  // imports: [TypeOrmModule.forFeature([CountryEntity])],
  imports: [
    TypeOrmModule.forFeature([
      TechnologyEntity,
      SharingEntity,
      SpeedEntity,
      ServiceStatusEntity,
    ]),
  ],
  providers: [
    TechnologyService,
    SharingService,
    SpeedService,
    ServiceStatusService,
  ],
  controllers: [
    TechnologyController,
    SharingController,
    SpeedController,
    ServiceStatusController,
  ],
  exports: [
    TechnologyService,
    SharingService,
    SpeedService,
    ServiceStatusService,
    TypeOrmModule,
  ],
})
export class WorkOrdersConnectivityModule {}
