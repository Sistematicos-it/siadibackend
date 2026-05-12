import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiaryTypeEntity } from './entities/beneficiary-type.entity';
import { BeneficiaryTypeService } from './services/beneficiary-type.service';
import { BeneficiaryTypeController } from './controllers/beneficiary-type.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BeneficiaryTypeEntity])],
  providers: [BeneficiaryTypeService],
  controllers: [BeneficiaryTypeController],
  exports: [BeneficiaryTypeService, TypeOrmModule],
})
export class BeneficiaryTypesModule {}
