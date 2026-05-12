import { BaseEntity } from 'src/config';
import { ASSET_CATEGORY, IAssetType, IAssetTypeDetails } from '../interfaces/asset-type.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AssetTypeEntity } from './asset-type.entity';

@Entity({ name: 'asset_type_details' })
export class AssetTypeDetailsEntity extends BaseEntity implements IAssetTypeDetails {
  @Column()
  name: string;

  @Column()
  required: boolean;

  @ManyToOne(()=>AssetTypeEntity, (assetType) => assetType.details)
  asset_type: AssetTypeEntity
}
