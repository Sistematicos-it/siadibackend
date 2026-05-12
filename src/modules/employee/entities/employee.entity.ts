import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import {
  GENDERS,
  IEmployee,
  MARITAL_STATUS,
} from '../interfaces/employee.interface';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { BaseEntity } from 'src/config';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { EducationLevelEntity } from 'src/modules/nomencladores/education-level/entities/education-level.entity';
import { SpecializationEntity } from 'src/modules/nomencladores/specializations/entities/specialization.entity';
import { EmployeePeriodsEntity } from './employee_periods.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';
import { ROLES } from 'src/constants';
import { EMPLOYEE_STATUS, VULNERABILITY_STATUS } from 'src/constants/enums';
import { EmployeeVulnerabilityPeriodEntity } from './employee_vulnerability_period.entity';

@Entity({ name: 'employee' })
export class EmployeeEntity extends BaseEntity implements IEmployee {
  @Column()
  name: string;

  @Column({ unique: true })
  id_value: string;

  @Column()
  position: string;

  @Column({ default: false })
  sign_authorization: boolean;

  @Column({nullable: true})
  code?: string;

  @Column()
  address: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: true})
  phone?: string;



  @Column({nullable: true})
  facebook_profile?: string;

  @Column({ type: 'float', nullable: true })
  salary?: number;

  @Column({
    type: 'enum',
    enum: GENDERS,
  })
  gender?: GENDERS;

  @Column({
    type: 'enum',
    enum: MARITAL_STATUS,
  })
  marital_status?: MARITAL_STATUS;

  @Column({
    type: 'enum',
    enum: ROLES,
    default: ROLES.UNASSIGNED,
    nullable: true,
  })
  user_type: ROLES;

  @Column({
    type: 'enum',
    enum: EMPLOYEE_STATUS,
    default: EMPLOYEE_STATUS.ACTIVE,
    nullable: true,
  })
  status: EMPLOYEE_STATUS;

  @ManyToOne(() => ProfessionalTitleEntity)
  @JoinColumn()
  professional_title?: ProfessionalTitleEntity;

  @ManyToOne(() => EducationLevelEntity)
  @JoinColumn()
  education_level?: EducationLevelEntity;

  @ManyToOne(() => SpecializationEntity)
  @JoinColumn()
  specialization?: SpecializationEntity;

  @OneToOne(() => UserEntity, (user) => user.employee)
  @JoinColumn()
  user?: UserEntity;

  @OneToMany(() => EmployeePeriodsEntity, (period) => period.employee)
  periods: EmployeePeriodsEntity[];

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  point: PointEntity;

  @OneToMany(() => WorkOrderEntity, (workOrder) => workOrder.zoneCoordinator, {
    nullable: true,
  })
  @JoinColumn()
  workOrderZoneCoordinator: WorkOrderEntity[];

  @OneToMany(() => WorkOrderEntity, (workOrder) => workOrder.applicant, {
    nullable: true,
  })
  @JoinColumn()
  workOrderApplicant: WorkOrderEntity[];

  @OneToMany(() => WorkOrderEntity, (workOrder) => workOrder.authorizer, {
    nullable: true,
  })
  @JoinColumn()
  workOrderAuthorizer: WorkOrderEntity[];

  // @OneToMany(() => PlanningEntity, (planning) => planning.employee, {
  //   nullable: true,
  // })
  // @JoinColumn()
  // planning: PlanningEntity[];

  @OneToMany(()=> EmployeeVulnerabilityPeriodEntity, (vulnerability)=>vulnerability.employee)
  vulnerability_periods: EmployeeVulnerabilityPeriodEntity[]
}
