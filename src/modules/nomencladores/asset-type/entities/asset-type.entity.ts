import { BaseEntity } from 'src/config';
import { ASSET_CATEGORY, IAssetType } from '../interfaces/asset-type.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { AssetTypeDetailsEntity } from './asset-type-details.entity';

@Entity({ name: 'asset_type' })
export class AssetTypeEntity extends BaseEntity implements IAssetType {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: ASSET_CATEGORY })
  category: ASSET_CATEGORY;

  @OneToMany(()=>AssetTypeDetailsEntity, (details)=>details.asset_type)
  details: AssetTypeDetailsEntity[]
}
