import { BaseEntity } from 'src/config';
import { IReport } from '../interfaces/report.interface';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';

@Entity({name: "report"})
export class ReportEntity extends BaseEntity implements IReport {
  @Column()
  name: string;

  @OneToMany(() => PlanningEntity, planning => planning.reports, {nullable: true})
  @JoinColumn()
  planning: PlanningEntity[];
}
