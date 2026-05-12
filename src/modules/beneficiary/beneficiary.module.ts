import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiaryEntity } from './entities/beneficiary.entity';
import { BeneficiaryService } from './services/beneficiary.service';
import { BeneficiaryController } from './controllers/beneficiary.controller';
import { AddressService } from '../nomencladores/geolocation/services/address.service';
import { BeneficiaryTypeService } from '../nomencladores/beneficiary-type/services/beneficiary-type.service';
import { ProfessionalTitleService } from '../nomencladores/professional-title/services/professional-title.service';
import { PoliticalLineService } from '../nomencladores/political-line/services/political-line.service';
import { InstitutionService } from '../nomencladores/institution/services/institution.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BeneficiaryEntity])],
  providers: [BeneficiaryService],
  controllers: [BeneficiaryController],
  exports: [BeneficiaryService, TypeOrmModule],
})
export class BeneficiaryModule {}
