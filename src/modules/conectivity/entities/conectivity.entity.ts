import { BaseEntity } from 'src/config';
import { IConectivity } from '../interfaces/conectivity.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { TechnologyEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/technology.entity';
import { SharingEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/sharing.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ServiceStatusEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/service-status.entity';
import { SpeedEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/speed.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';

@Entity({ name: 'conectivity' })
export class ConectivityEntity extends BaseEntity implements IConectivity {
  @Column({ type: 'timestamp with time zone', nullable: true })
  date?: Date;

  @Column()
  installationCost: number;

  @Column()
  monthlyValue: number;

  @Column({ nullable: true })
  pilot?: string;

  @Column({ nullable: true })
  petition?: string;

  @Column()
  availability: number;

  @ManyToOne(() => TechnologyEntity)
  @JoinColumn()
  technology: TechnologyEntity;

  @ManyToOne(() => SharingEntity)
  @JoinColumn()
  sharing: SharingEntity;


  @ManyToOne(() => PointEntity, (point)=>point.conectivity)
  @JoinColumn()
  point: PointEntity;

  @ManyToOne(() => ServiceStatusEntity, {
    nullable: true,
  })
  @JoinColumn()
  serviceStatus?: ServiceStatusEntity;

  @ManyToOne(() => SpeedEntity)
  @JoinColumn()
  speed: SpeedEntity;

  @ManyToOne(() => WorkOrderEntity)
  @JoinColumn()
  workOrder: WorkOrderEntity;


  @OneToMany(() => FileEntity, (file) => file.conectivity, { nullable: true })
  files: FileEntity[];
}
