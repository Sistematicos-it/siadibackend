import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTypeEntity } from './entities/asset-type.entity';
import { AssetTypeService } from './services/asset-type.service';
import { AssetTypeController } from './controllers/asset-type.controller';
import { AssetTypeDetailsEntity } from './entities/asset-type-details.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AssetTypeEntity, AssetTypeDetailsEntity])],
  providers: [AssetTypeService],
  controllers: [AssetTypeController],
  exports: [AssetTypeService, TypeOrmModule],
})
export class AssetTypesModule {}
