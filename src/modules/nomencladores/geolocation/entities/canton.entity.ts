import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { RegionEntity } from './region.entity';
import { ProvinceEntity } from './province.entity';
import { ParishEntity } from './parish.entity';


@Entity({ name: 'canton' })
export class CantonEntity extends BaseEntity {
  
  @Column()
  name: string;

  @ManyToOne(() => ProvinceEntity, province => province.cantons)
  province: ProvinceEntity;

  @OneToMany(() => ParishEntity, parish => parish.canton, {nullable: true })
  parishes: ParishEntity[];

}