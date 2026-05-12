import { BaseEntity } from 'src/config';
import {
  IBeneficiary,
  government_affinity,
} from '../interfaces/beneficiary.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { BeneficiaryTypeEntity } from 'src/modules/nomencladores/beneficiary-type/entities/beneficiary-type.entity';
import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { InstitutionEntity } from 'src/modules/nomencladores/institution/entities/institution.entity';
import { PoliticalLineEntity } from 'src/modules/nomencladores/political-line/entities/political-line.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';

@Entity({ name: 'beneficiary' })
export class BeneficiaryEntity extends BaseEntity implements IBeneficiary {
  @Column()
  name: string;

  @Column({ nullable: true })
  id_value?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  alt_phone?: string;

  @Column({ nullable: true })
  cell_phone?: string;

  @Column({ nullable: true })
  facebook_link?: string;

  @Column({ nullable: true })
  web_link?: string;

  @Column({ type: 'enum', enum: government_affinity, nullable: true })
  government_affinity?: government_affinity;

  @Column({ type: 'enum', enum: GENDERS, nullable: true })
  gender?: GENDERS;

  @Column({ type: 'enum', enum: MARITAL_STATUS, nullable: true })
  marital_status?: MARITAL_STATUS;

  @Column({nullable: true })
  birth_date?: string;

  @ManyToOne(() => BeneficiaryTypeEntity)
  @JoinColumn()
  type: BeneficiaryTypeEntity;

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  address?: AddressEntity;

  @ManyToOne(() => ProfessionalTitleEntity, { nullable: true })
  @JoinColumn()
  title?: ProfessionalTitleEntity;

  @ManyToOne(() => InstitutionEntity, { nullable: true })
  @JoinColumn()
  institution?: InstitutionEntity;

  @ManyToOne(() => PoliticalLineEntity, { nullable: true })
  @JoinColumn()
  political_line?: PoliticalLineEntity;

  @OneToMany(() => FileEntity, (file) => file.beneficiary, { nullable: true })
  files: FileEntity[];

  @OneToMany(() => WorkOrderEntity, (workOrder) => workOrder.beneficiary, {
    nullable: true,
  })
  @JoinColumn()
  workOrder: WorkOrderEntity[];
}
