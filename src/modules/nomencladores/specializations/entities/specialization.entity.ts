import { BaseEntity } from 'src/config';
import { ISpecialization } from '../interfaces/specialization.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "specialization"})
export class SpecializationEntity extends BaseEntity implements ISpecialization {
  @Column()
  name: string;
}
