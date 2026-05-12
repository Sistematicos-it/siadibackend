import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IAsset } from '../interfaces/asset.interface';
import { AssetTypeEntity } from 'src/modules/nomencladores/asset-type/entities/asset-type.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { AssetDetailsEntity } from './asset-details.entity';
import { ASSET_OWNER, ASSET_STATUS } from 'src/constants/enums';

@Entity({ name: 'asset' })
export class AssetEntity extends BaseEntity implements IAsset {
  @Column()
  description: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true, enum: ASSET_STATUS, default: ASSET_STATUS.FUNCTIONAL })
  status?: ASSET_STATUS;

  @Column({ nullable: true, enum: ASSET_OWNER })
  asset_owner?: ASSET_OWNER;


  @Column({nullable: true})
  cnt_code?: string


  @Column({ default: false, nullable: true })
  isOldProject?: boolean;

  @Column({ nullable: true, default: 1 })
  amount?: number;

  @Column({ nullable: true })
  observation?: string;

  @ManyToOne(() => AssetTypeEntity)
  @JoinColumn()
  type: AssetTypeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  responsible_employee: EmployeeEntity;

  @OneToMany(() => AssetDetailsEntity, (detail) => detail.asset, {
    nullable: true,
  })
  details: AssetDetailsEntity[];
}
