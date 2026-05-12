import { BaseEntity } from 'src/config';
import { IBeneficiaryType } from '../interfaces/beneficiary-type.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "beneficiary_type"})
export class BeneficiaryTypeEntity extends BaseEntity implements IBeneficiaryType {
  @Column()
  name: string;
}
