import { Global, Module } from '@nestjs/common';
import { AssetService } from './services/asset.service';
import { AssetController } from './controllers/asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './entities/asset.entity';
import { AssetDetailsEntity } from './entities/asset-details.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, AssetDetailsEntity])],
  providers: [AssetService],
  controllers: [AssetController],
  exports: [AssetService, TypeOrmModule],
})
export class AssetModule {}
