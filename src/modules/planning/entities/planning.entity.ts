import { BaseEntity } from 'src/config';
import { IPlanning } from '../interfaces/planning.interface';
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
  STATUS_IN_PLANNING,
} from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { EquipmentEntity } from 'src/modules/nomencladores/equipment/entities/equipment.entity';
import { ComponentEntity } from 'src/modules/nomencladores/component/entities/component.entity';
import { ReportEntity } from 'src/modules/nomencladores/reports/entities/report.entity';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';

@Entity({ name: 'planning' })
export class PlanningEntity extends BaseEntity implements IPlanning {
  @Column({ type: 'enum', enum: PLANIFICATIONS_ACTIVITIES })
  activity: PLANIFICATIONS_ACTIVITIES;

  @Column({nullable: true})
  start_date?: string;

  @Column({ type: 'timestamp with time zone' , precision: 3, nullable: true})
  date?: Date;


  @Column({ type: 'time' })
  estimated_time: string;

  @Column({ nullable: true })
  applyPerDiem: boolean;

  @Column({ nullable: true })
  observation: string;

  @Column({
    type: 'enum',
    enum: STATUS_IN_PLANNING,
    default: STATUS_IN_PLANNING.DRAFT,
  })
  status: STATUS_IN_PLANNING;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn()
  employee: EmployeeEntity;

  @ManyToOne(() => AddressEntity, (address) => address.planningSource, {
    nullable: true,
  })
  @JoinColumn()
  sourceAddress: AddressEntity;

  @ManyToOne(() => PointEntity, (point) => point.planning, { nullable: true })
  @JoinColumn()
  visitPoint: PointEntity;

  @ManyToOne(() => AddressEntity, (address) => address.planningDestination, {
    nullable: true,
  })
  @JoinColumn()
  destinationAddress: AddressEntity;

  @ManyToOne(() => ReportEntity, (report) => report.planning, {
    nullable: true,
  })
  @JoinColumn()
  reports: ReportEntity;

  @ManyToMany(() => EquipmentEntity, (equipment) => equipment.planning, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  equipments: EquipmentEntity[];

  @ManyToMany(() => ComponentEntity, (component) => component.planning, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  components: ComponentEntity[];

  @ManyToMany(() => IncidentEntity, (incident) => incident.planning, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  incidents: IncidentEntity[];
}
