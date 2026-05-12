import { BaseEntity } from 'src/config';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EmployeeEntity } from './employee.entity';

@Entity({ name: 'employee_transfer' })
export class EmployeeTransferEntity extends BaseEntity {
  @Column({ nullable: true })
  reason: string;

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  origin_point: PointEntity;

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  destination_point: PointEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  employee: EmployeeEntity;
}
