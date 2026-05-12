import { Global, Module } from '@nestjs/common';
import { CountryService } from './services/country.service';
import { CountryController } from './controllers/country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './entities/country.entity';
import { RegionService } from './services/region.service';
import { RegionController } from './controllers/region.controller';
import { RegionEntity } from './entities/region.entity';
import { ProvinceEntity } from './entities/province.entity';
import { ProvinceService } from './services/province.service';
import { ProvinceController } from './controllers/province.controller';
import { CantonEntity } from './entities/canton.entity';
import { CantonService } from './services/canton.service';
import { CantonController } from './controllers/canton.controller';
import { ParishEntity } from './entities/parish.entity';
import { AddressEntity } from './entities/address.entity';
import { ParishService } from './services/parish.service';
import { AddressService } from './services/address.service';
import { ParishController } from './controllers/parish.controller';
import { AddressController } from './controllers/address.controller';


@Global() //Esto hace que este modulo sea de manera global en toda la aplicacion y no tenga que estar importandolo
@Module({
  // imports: [TypeOrmModule.forFeature([CountryEntity])],
  imports: [
    TypeOrmModule.forFeature(
      [
        CountryEntity,
        RegionEntity,
        ProvinceEntity,
        CantonEntity,
        ParishEntity,
        AddressEntity,
      ]
    )],
  providers: [
    CountryService,
    RegionService,
    ProvinceService,
    CantonService,
    ParishService,
    AddressService
  ],
  controllers: [
    CountryController,
    RegionController,
    ProvinceController,
    CantonController,
    ParishController,
    AddressController,
  ],
  exports: [
    CountryService,
    RegionService,
    ProvinceService,
    CantonService,
    ParishService,
    AddressService,
    TypeOrmModule
  ],
})
export class GeolocationModule {}
