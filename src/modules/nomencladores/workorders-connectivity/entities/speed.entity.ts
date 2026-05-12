import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'speed' })
export class SpeedEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  download: number;

  @Column()
  upFile: number;

  @Column()
  slug: string;

}