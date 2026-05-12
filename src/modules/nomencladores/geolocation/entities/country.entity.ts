import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RegionEntity } from './region.entity';


@Entity({ name: 'country' })
export class CountryEntity extends BaseEntity {
  
  @Column({nullable: true})
  code: string;

  @Column({unique: true })
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => RegionEntity, region => region.country, {nullable: true })
  regions: RegionEntity[];

}