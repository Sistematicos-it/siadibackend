import { truncateSync } from 'fs';
import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IAsset, IAssetDetails } from '../interfaces/asset.interface';
import { AssetEntity } from './asset.entity';

@Entity({ name: 'asset_details' })
export class AssetDetailsEntity extends BaseEntity implements IAssetDetails {
  @Column()
  name: string;
  @Column({nullable: true, default: "Y"})
  value?: string;

  @ManyToOne(() => AssetEntity, (asset)=>asset.details, {nullable: true})
  asset: AssetEntity;
}
