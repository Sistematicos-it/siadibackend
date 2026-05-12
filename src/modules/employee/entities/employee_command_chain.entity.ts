import { BaseEntity } from 'src/config';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EmployeeEntity } from './employee.entity';

@Entity({ name: 'employee_command_chain' })
export class EmployeeCommandChainEntity extends BaseEntity {
  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  boss: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  subordinate: EmployeeEntity;
}
