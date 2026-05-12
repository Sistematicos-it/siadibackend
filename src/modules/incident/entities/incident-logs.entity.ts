import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IIncidentLogs } from '../interfaces/incident.interface';
import { IncidentEntity } from './incident.entity';
import { DisconnectionIncidentEntity } from './disconnection-incident.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { SUPPORT_TYPE } from 'src/constants/enums';

@Entity({ name: 'incident_log' })
export class IncidentLogsEntity extends BaseEntity implements IIncidentLogs {
  @Column()
  details: string;

  

  @ManyToOne(() => IncidentEntity, (incident) => incident.logs, {
    nullable: true,
  })
  @JoinColumn()
  incident?: IncidentEntity;

  @ManyToOne(() => DisconnectionIncidentEntity, (incident) => incident.logs, { nullable: true })
  @JoinColumn()
  disconnection_incident?: DisconnectionIncidentEntity;

  @ManyToOne(()=> EmployeeEntity, {nullable: true})
  @JoinColumn()
  made_by: EmployeeEntity
}
