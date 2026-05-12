import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CountryEntity } from './country.entity';
import { ProvinceEntity } from './province.entity';


@Entity({ name: 'region' })
export class RegionEntity extends BaseEntity {
  
  @Column()
  name: string;

  @ManyToOne(() => CountryEntity, country => country.regions)
  country: CountryEntity;

  @OneToMany(() => ProvinceEntity, province => province.region, {nullable: true })
  provinces: ProvinceEntity[];

}