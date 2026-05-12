import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CitizenshipController } from './controllers/citizenship.controller';
import { CitizenshipEntity } from './entities/citizenship.entity';
import { CitizenshipService } from './services/citizenship.service';
import { ActivitieEntity } from './entities/activitie.entity';
import { ActivitieService } from './services/activitie.service';
import { ActivitieController } from './controllers/activitie.controller';

@Global() //Esto hace que este modulo sea de manera global en toda la aplicacion y no tenga que estar importandolo
@Module({
  // imports: [TypeOrmModule.forFeature([CountryEntity])],
  imports: [
    TypeOrmModule.forFeature(
      [
        CitizenshipEntity,
        ActivitieEntity
      ]
    )],
  providers: [
    CitizenshipService,
    ActivitieService
  ],
  controllers: [
    CitizenshipController,
    ActivitieController
  ],
  exports: [
    CitizenshipService,
    ActivitieService,
    TypeOrmModule
  ],
})
export class PersonDataModule {}
