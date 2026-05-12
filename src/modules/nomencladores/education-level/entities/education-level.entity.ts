import { BaseEntity } from 'src/config';
import { IEducationLevel } from '../interfaces/education-level.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "education_level"})
export class EducationLevelEntity extends BaseEntity implements IEducationLevel {
  @Column()
  name: string;
}
