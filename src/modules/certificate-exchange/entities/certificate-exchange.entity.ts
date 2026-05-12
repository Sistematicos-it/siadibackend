import { BaseEntity } from 'src/config';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { CERTIFICATE_EXCHANGE_STATUS } from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';

@Entity({ name: 'certificate_exchange' })
export class CertificateExchangeEntity extends BaseEntity {
  @Column()
  certificate_code: string;

  @Column({ enum: CERTIFICATE_EXCHANGE_STATUS, default: CERTIFICATE_EXCHANGE_STATUS.REQUESTED })
  status: CERTIFICATE_EXCHANGE_STATUS;

  @Column({ nullable: true })
  observations?: string;

  @ManyToOne(() => CourseEntity, { nullable: true })
  @JoinColumn()
  course: CourseEntity;

  @ManyToOne(() => CitizenEntity, { nullable: true })
  @JoinColumn()
  citizen: CitizenEntity;

  @ManyToOne(() => ProgramEntity, { nullable: true })
  @JoinColumn()
  program: ProgramEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  requester: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn()
  reviewer: EmployeeEntity;
}
