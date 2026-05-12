import { BaseEntity } from 'src/config';
import { IVisitType } from '../interfaces/visit-type.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'visit_type' })
export class VisitTypeEntity extends BaseEntity implements IVisitType {
  @Column()
  name: string;

  @Column()
  value: string;
}
