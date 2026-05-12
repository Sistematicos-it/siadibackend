import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'citizenship' })
export class CitizenshipEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  slug: string;

}