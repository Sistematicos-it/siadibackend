import { BaseEntity } from 'src/config';
import { IIncidentIssues } from '../interfaces/incident-issues.interface';
import { Column, Entity } from 'typeorm';
import { ROLES } from 'src/constants';
import { INCIDENT_EMPLOYEE_TYPE, TYPE_OF_INCIDENT } from 'src/constants/enums';

@Entity({name: "incidentIssues"})
export class IncidentIssuesEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({type: 'enum', enum: TYPE_OF_INCIDENT})
  incidentType: TYPE_OF_INCIDENT;

  @Column({type: 'enum', enum: INCIDENT_EMPLOYEE_TYPE})
  employeeType: INCIDENT_EMPLOYEE_TYPE;
}
