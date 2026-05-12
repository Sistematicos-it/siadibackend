import { BaseEntity } from 'src/config';
import { IFile } from '../interfaces/file.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FaceToFaceTrainingEntity } from 'src/modules/nomencladores/face-to-face-training/entities/face-to-face-training.entity';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';
import { EmployeePeriodsEntity } from 'src/modules/employee/entities/employee_periods.entity';
import { BeneficiaryEntity } from 'src/modules/beneficiary/entities/beneficiary.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';
import { PermissionRequestEntity } from 'src/modules/permissionRequest/entities/permission-request.entity';
import { DisconnectionIncidentEntity } from 'src/modules/incident/entities/disconnection-incident.entity';
import { FileCategoryEntity } from './file-category.entity';
import { ConnectionLogsEntity } from 'src/modules/connection-logs/entities/connection-logs.entity';

@Entity({ name: 'file' })
export class FileEntity extends BaseEntity implements IFile {
  @Column()
  fileUrl: string;

  @Column()
  fileType: string;

  @Column({nullable: true})
  originalName: string;

  @ManyToOne(() => FaceToFaceTrainingEntity, (training) => training.files, {
    nullable: true,
  })
  training: FaceToFaceTrainingEntity;

  @ManyToOne(() => IncidentEntity, (incident) => incident.files, {
    nullable: true,
  })
  incident: IncidentEntity;

  @ManyToOne(() => EmployeePeriodsEntity, (period) => period.files, {
    nullable: true,
  })
  employee_period: EmployeePeriodsEntity;

  @ManyToOne(() => BeneficiaryEntity, (beneficiary) => beneficiary.files, {
    nullable: true,
  })
  beneficiary: BeneficiaryEntity;

  @ManyToOne(() => PointEntity, (point) => point.files, {
    nullable: true,
  })
  point: PointEntity;

  @ManyToOne(() => ProgramEntity, (program) => program.files, {
    nullable: true,
  })
  program: ProgramEntity;

  @ManyToOne(() => WorkOrderEntity, (workOrder) => workOrder.files, {
    nullable: true,
  })
  workOrder: WorkOrderEntity;

  @ManyToOne(() => ConectivityEntity, (conectivity) => conectivity.files, {
    nullable: true,
  })
  conectivity: ConectivityEntity;

  @ManyToOne(() => PermissionRequestEntity, (permissionRequest) => permissionRequest.files, {
    nullable: true,
  })
  permissionRequest: PermissionRequestEntity;

  @ManyToOne(() => DisconnectionIncidentEntity, (incident) => incident.files, {
    nullable: true,
  })
  disconnection_incident: DisconnectionIncidentEntity;

  @ManyToOne(() => FileCategoryEntity, (fileCategory) => fileCategory.files, {
    nullable: true,
  })
  fileCategory: FileCategoryEntity;

  @ManyToOne(() => ConnectionLogsEntity, (conectionsLogs) => conectionsLogs.files, {
    nullable: true,
  })
  conecctionsLogs: ConnectionLogsEntity;
}
