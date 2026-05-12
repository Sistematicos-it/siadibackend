import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { RegionEntity } from './region.entity';
import { CantonEntity } from './canton.entity';


@Entity({ name: 'province' })
export class ProvinceEntity extends BaseEntity {
  
  @Column()
  name: string;

  @ManyToOne(() => RegionEntity, country => country.provinces)
  region: RegionEntity;

  @OneToMany(() => CantonEntity, canton => canton.province, {nullable: true })
  cantons: CantonEntity[];

}