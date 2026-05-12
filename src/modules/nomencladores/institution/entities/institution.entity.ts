import { BaseEntity } from 'src/config';
import { IInstitution } from '../interfaces/institution.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "institution"})
export class InstitutionEntity extends BaseEntity implements IInstitution {
  @Column()
  name: string;
}
