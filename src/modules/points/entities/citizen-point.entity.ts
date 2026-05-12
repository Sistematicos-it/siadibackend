import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PointEntity } from './point.entity';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';

@Entity({ name: 'citizen_point' })
export class CitizenPointEntity extends BaseEntity {
  

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  point: PointEntity;

  @ManyToOne(() => CitizenEntity)
  @JoinColumn()
  citizen: CitizenEntity;
}
