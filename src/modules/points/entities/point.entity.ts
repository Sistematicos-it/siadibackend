import { BaseEntity } from 'src/config';
import { IPoint } from '../interfaces/point.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { PointStatusEntity } from 'src/modules/nomencladores/point-status/entities/point-status.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { BeneficiaryEntity } from 'src/modules/beneficiary/entities/beneficiary.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { VisitRecordEntity } from 'src/modules/visit-record/entities/visit-record.entity';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';
import { PlanningAdvancedEntity } from 'src/modules/planning/entities/planning-advanced.entity';
import { ConnectionLogsEntity } from 'src/modules/connection-logs/entities/connection-logs.entity';
import { TYPE_OF_POINT } from 'src/constants/enums';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';
import { DisconnectionIncidentEntity } from 'src/modules/incident/entities/disconnection-incident.entity';

@Entity({ name: 'point' })
export class PointEntity extends BaseEntity implements IPoint {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  observations?: string;

  @Column({nullable:true})
  agreement?: string;

  @Column({ nullable: true })
  hasAgreements?: boolean;

  @Column({ nullable: true })
  isCsr?: boolean;

  @Column({nullable: true, enum: TYPE_OF_POINT, default: TYPE_OF_POINT.NORMAL})
  type?:TYPE_OF_POINT

  @Column({ nullable: true })
  ip?: string;

  @OneToMany(() => VisitRecordEntity, (visit) => visit.point, {
    nullable: true,
  })
  visits: VisitRecordEntity[];

  @ManyToOne(() => PointStatusEntity, { nullable: true })
  @JoinColumn()
  status?: PointStatusEntity;

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  address?: AddressEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({name: 'facilitator_employee_id'})
  facilitator_employee?: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  manager_employee?: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  coordinator_employee?: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  technical_asistent_employee?: EmployeeEntity;

  @ManyToOne(() => BeneficiaryEntity, { nullable: true })
  @JoinColumn()
  beneficiary?: BeneficiaryEntity;

  @OneToMany(() => FileEntity, (file) => file.point, { nullable: true })
  files: FileEntity[];

  @OneToMany(
    () => PlanningAdvancedEntity,
    (planningAdvanced) => planningAdvanced.visitPoint,
    { nullable: true },
  )
  planningAdvanced: PlanningAdvancedEntity[];

  @OneToMany(() => PlanningEntity, (planning) => planning.visitPoint, {
    nullable: true,
  })
  planning: PlanningEntity[];

  @OneToMany(() => ConnectionLogsEntity, (cnx) => cnx.point, { nullable: true })
  @JoinColumn()
  conecctionsLogs: ConnectionLogsEntity[];

  @OneToMany(()=>ConectivityEntity, (conectivity)=>conectivity.point, {nullable: true})
  conectivity: ConectivityEntity[]

  @OneToMany(()=>DisconnectionIncidentEntity, (incident)=>incident.point, {nullable: true})
  disconnectionIncident: DisconnectionIncidentEntity[]
}
