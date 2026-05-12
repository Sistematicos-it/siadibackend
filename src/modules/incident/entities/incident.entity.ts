import { BaseEntity } from 'src/config';
import { IIncident } from '../interfaces/incident.interface';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IncidentIssuesEntity } from 'src/modules/nomencladores/incident-issues/entities/incident-issues.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { IncidentLogsEntity } from './incident-logs.entity';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';
import { PlanningAdvancedEntity } from 'src/modules/planning/entities/planning-advanced.entity';

@Entity({ name: 'incident' })
export class IncidentEntity extends BaseEntity implements IIncident {
  @Column()
  @Generated('increment')
  incident_number: number;

  @Column({nullable: true})
  incident_code: string;

  @Column({nullable: true})
  cnt_ticket?: string;

  @Column()
  observation?: string;

  @Column({ type: 'timestamp with time zone' , precision: 3, nullable: true})
  solved_date?: Date;

  @Column({ type: 'timestamp with time zone' , precision: 3, nullable: true})
  closed_date?: Date;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  requester: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  assigned_to: EmployeeEntity;

  @ManyToOne(() => IncidentIssuesEntity)
  @JoinColumn()
  issue: IncidentIssuesEntity;

  @OneToMany(() => FileEntity, (file) => file.incident, { nullable: true })
  files: FileEntity[];

  @ManyToOne(()=>PointEntity, {nullable: true})
  point?: PointEntity

  @OneToMany(()=>IncidentLogsEntity, (log)=> log.incident)
  logs: IncidentLogsEntity[]

  @ManyToMany(() => PlanningEntity, (planning) => planning.incidents, {nullable: true})
  planning: PlanningEntity[];


}
