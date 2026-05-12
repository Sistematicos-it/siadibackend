import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentEntity } from './entities/equipment.entity';
import { EquipmentService } from './services/equipment.service';
import { EquipmentController } from './controllers/equipment.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EquipmentEntity])],
  providers: [EquipmentService],
  controllers: [EquipmentController],
  exports: [EquipmentService, TypeOrmModule],
})
export class EquipmentsModule {}
