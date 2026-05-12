import { BaseEntity } from 'src/config';
import { IIncident } from '../interfaces/incident.interface';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IncidentIssuesEntity } from 'src/modules/nomencladores/incident-issues/entities/incident-issues.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { IncidentLogsEntity } from './incident-logs.entity';

@Entity({ name: 'disconnection_incident' })
export class DisconnectionIncidentEntity extends BaseEntity {
  @Column()
  @Generated('increment')
  incident_number: number;

  @Column()
  observation?: string;

  @Column({nullable: true, type: "timestamp with time zone", precision: 3})
  solved_date?: Date;

  @Column({nullable: true, type: "timestamp with time zone", precision: 3})
  closed_date?: Date;

  @Column({nullable: true})
  cnt_ticket?: string;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  requester: EmployeeEntity;

  @ManyToOne(() => PointEntity, (point)=>point.disconnectionIncident,{ nullable: true})
  @JoinColumn()
  point: PointEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  assigned_to: EmployeeEntity;

  @OneToMany(()=>IncidentLogsEntity, (log)=> log.disconnection_incident)
  logs: IncidentLogsEntity[]
  

  @OneToMany(() => FileEntity, (file) => file.disconnection_incident, { nullable: true })
  files: FileEntity[];
}
