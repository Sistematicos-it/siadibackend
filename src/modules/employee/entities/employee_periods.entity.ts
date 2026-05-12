import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IPeriods } from '../interfaces/employee.interface';
import { BaseEntity } from 'src/config';
import { EmployeeEntity } from './employee.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';

@Entity({ name: 'employee_periods' })
export class EmployeePeriodsEntity extends BaseEntity implements IPeriods {
  @Column({ nullable: true })
  start_date: string;

  @Column({ nullable: true })
  end_date?: string;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.periods)
  employee: EmployeeEntity;

  @OneToMany(() => FileEntity, (file) => file.employee_period)
  files?: FileEntity[];
}
