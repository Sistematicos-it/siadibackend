import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CantonEntity } from './canton.entity';
import { TYPE_OF_PARISHES } from 'src/constants/enums';
import { AddressEntity } from './address.entity';


@Entity({ name: 'parish' })
export class ParishEntity extends BaseEntity {
  
  @Column()
  name: string;

  @ManyToOne(() => CantonEntity, canton => canton.parishes)
  canton: CantonEntity;

  @OneToMany(() => AddressEntity, address => address.parish, {nullable: true })
  addresses: AddressEntity[];

  @Column({
    type: 'enum',
    enum: TYPE_OF_PARISHES,
    default: TYPE_OF_PARISHES.RURAL,
  })
  type: TYPE_OF_PARISHES;
}