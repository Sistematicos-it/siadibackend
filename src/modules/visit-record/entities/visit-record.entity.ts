import { BaseEntity } from 'src/config';
import { IVisitRecord } from '../interfaces/visit-record.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { InstitutionEntity } from 'src/modules/nomencladores/institution/entities/institution.entity';
import { PoliticalLineEntity } from 'src/modules/nomencladores/political-line/entities/political-line.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { VisitTypeEntity } from 'src/modules/visit-type/entities/visit-type.entity';

@Entity({ name: 'visit_record' })
export class VisitRecordEntity extends BaseEntity implements IVisitRecord {
  @Column()
  date: Date;

  @ManyToOne(() => PointEntity, (point) => point.visits, {nullable: true})
  @JoinColumn()
  point: PointEntity;

  @ManyToOne(() => CitizenEntity, {nullable: true})
  @JoinColumn()
  citizen: CitizenEntity;

  @ManyToOne(() => VisitTypeEntity)
  @JoinColumn()
  visit_type: VisitTypeEntity;
}
