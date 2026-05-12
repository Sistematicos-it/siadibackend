import { BaseEntity } from 'src/config';
import {
  ICitizen,
  disability,
  ethnicity,
} from '../interfaces/citizen.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { GENDERS } from 'src/modules/employee/interfaces/employee.interface';

import { CitizenshipEntity } from 'src/modules/nomencladores/person-data/entities/citizenship.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';

@Entity({ name: 'citizen' })
export class CitizenEntity extends BaseEntity implements ICitizen {
  @Column()
  name: string;

  @Column({ unique: true })
  id_value: string;

  @Column({nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  isPregnant?: boolean;

  @Column({ nullable: true })
  hasUnderAgeKids?: boolean;

  @Column({ nullable: true })
  cell_phone?: string;

  @Column({ type: 'enum', enum: GENDERS })
  gender: GENDERS;

  @Column({ nullable: true })
  birth_date?: string;

  @Column({
    type: 'enum',
    enum: disability,
    default: disability.none,
    nullable: true,
  })
  disability?: disability;

  @Column({ nullable: true })
  disabilityAmount?: number;

  @Column({ type: 'enum', enum: ethnicity })
  ethnicity: ethnicity;

  @ManyToOne(() => CitizenshipEntity)
  @JoinColumn()
  citizenship: CitizenshipEntity;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => PointEntity, {nullable: true})
  @JoinColumn()
  point?: PointEntity;
}
