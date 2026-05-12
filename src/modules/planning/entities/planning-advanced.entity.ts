import { BaseEntity } from 'src/config';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import {
  PLANIFICATIONS_ACTIVITIES,
  STATUS_ACTIVITIE_PLANNING,
  STATUS_IN_PLANNING,
  STATUS_VISIT_PLANNING,
} from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { EquipmentEntity } from 'src/modules/nomencladores/equipment/entities/equipment.entity';
import { ComponentEntity } from 'src/modules/nomencladores/component/entities/component.entity';
import { ReportEntity } from 'src/modules/nomencladores/reports/entities/report.entity';
import { IPlanningAdvanced } from '../interfaces/planning-advanced.interface';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';

@Entity({ name: 'planning_advanced' })
export class PlanningAdvancedEntity
  extends BaseEntity
  implements IPlanningAdvanced
{
  @Column({ type: 'enum', enum: STATUS_ACTIVITIE_PLANNING })
  activity: STATUS_ACTIVITIE_PLANNING;

  @Column({nullable: true})
  start_date?: string;

  @Column({type: 'time'})
  estimated_time: string;

  @Column({ nullable: true })
  observation: string;

  @Column({ type: 'timestamp with time zone' , precision: 3, nullable: true})
  date?: Date;

  @Column({
    type: 'enum',
    enum: STATUS_IN_PLANNING,
    default: STATUS_IN_PLANNING.DRAFT,
  })
  status: STATUS_IN_PLANNING;

  @Column({ nullable: true })
  visitReasonOfVisit: string;

  @Column({ nullable: true })
  applyPerDiem: boolean;

  @Column({ type: 'enum', enum: STATUS_VISIT_PLANNING, nullable: true})
  visitActivityType: STATUS_VISIT_PLANNING;

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  visitPoint: PointEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  employee: EmployeeEntity;

  @ManyToOne(() => AddressEntity, (address) => address.planningSource, {
    nullable: true,
  })
  @JoinColumn()
  sourceAddress: AddressEntity;

  @ManyToOne(() => AddressEntity, (address) => address.planningDestination, {
    nullable: true,
  })
  @JoinColumn()
  destinationAddress: AddressEntity;

}
