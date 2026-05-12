import { BaseEntity } from 'src/config';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'facilitator_planning' })
export class FacilitatorPlanningEntity extends BaseEntity {
  @Column({nullable: true})
  start_date?: string;

  @Column({ type: 'timestamp with time zone' , precision: 3, nullable: true})
  date?: Date;

  @Column({ type: 'time' })
  estimated_time: string;

  @Column({ nullable: true })
  observation: string;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  employee: EmployeeEntity;

  @Column({
    type: 'enum',
    enum: STATUS_IN_PLANNING,
    default: STATUS_IN_PLANNING.DRAFT,
  })
  status: STATUS_IN_PLANNING;
}
