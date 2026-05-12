import { BaseEntity } from 'src/config';
import { IAttendance } from '../interfaces/work-order.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TYPE_OF_ATTENDANCE, WORKORDER_STATUS } from 'src/constants/enums';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { BeneficiaryEntity } from 'src/modules/beneficiary/entities/beneficiary.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { TechnologyEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/technology.entity';
import { SharingEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/sharing.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';

@Entity({ name: 'workorder' })
export class WorkOrderEntity extends BaseEntity {
  @Column()
  orderNumber: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  date: Date;

  @Column({ nullable: true })
  downloadLink: number;

  @Column({ nullable: true })
  uploadLink: number;

  @Column({ nullable: true })
  availability: number;

  @Column({ nullable: true })
  installationCost: number;

  @Column({ nullable: true })
  monthlyValue: number;

  @Column({ nullable: true })
  description: string;

  @Column({enum: WORKORDER_STATUS, nullable: true, default: WORKORDER_STATUS.DRAFT })
  status?: WORKORDER_STATUS;

  @ManyToOne(() => AddressEntity, (address) => address.workOrder, {
    nullable: true,
  })
  address: AddressEntity;

  @ManyToOne(() => BeneficiaryEntity, (beneficiary) => beneficiary.workOrder, {
    nullable: true,
  })
  beneficiary: BeneficiaryEntity;

  @ManyToOne(
    () => EmployeeEntity,
    (employee) => employee.workOrderZoneCoordinator,
    {
      nullable: true,
    },
  )
  zoneCoordinator: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.workOrderApplicant, {
    nullable: true,
  })
  applicant: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.workOrderAuthorizer, {
    nullable: true,
  })
  authorizer: EmployeeEntity;

  @ManyToOne(() => TechnologyEntity, (technology) => technology.workOrder, {
    nullable: true,
  })
  technology: TechnologyEntity;

  @ManyToOne(() => SharingEntity, (sharing) => sharing.workOrder, {
    nullable: true,
  })
  sharing: SharingEntity;

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  point: PointEntity;

  @OneToMany(() => FileEntity, (file) => file.workOrder, {
    nullable: true,
    eager: true,
  })
  files: FileEntity[];
}
