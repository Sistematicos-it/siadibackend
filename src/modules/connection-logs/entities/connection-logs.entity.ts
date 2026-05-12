import { BaseEntity } from 'src/config';
import { IConnectionLogs } from '../interfaces/connection-logs.interface';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';

@Entity({name: "connection_logs"})
export class ConnectionLogsEntity extends BaseEntity {

  @Column({nullable: true})
  sent: number;
  
  @Column({nullable: true})
  received: number;

  @Column({nullable: true})
  lost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  loss_percentage: number;

  @Column({nullable: true})
  host: string;

  @Column({nullable: true})
  timestamp: Date;

  @OneToMany(() => FileEntity, (file) => file.conecctionsLogs, { nullable: true })
  files: FileEntity[];

  @ManyToOne(() => PointEntity, (point) => point.conecctionsLogs, { nullable: true })
  @JoinColumn()
  point: PointEntity;
}
