import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'activitie' })
export class ActivitieEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  slug: string;

}