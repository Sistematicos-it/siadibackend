import { BaseEntity } from 'src/config';
import { ICourse } from '../interfaces/course.interface';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { CourseCatalogEntity } from 'src/modules/nomencladores/course-catalog/entities/course-catalog.entity';

@Entity({ name: 'course' })
export class CourseEntity extends BaseEntity implements ICourse {
  @Column()
  name: string;

  @Column({ type: 'timestamp with time zone', nullable: true, precision: 3 })
  start_date?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, precision: 3 })
  end_date?: Date;

  @Column()
  week_days_amount?: number;

  @Column()
  observations?: string;

  @Column({nullable: true})
  coverImage: string;

  @ManyToOne(() => PointEntity)
  @JoinColumn()
  point: PointEntity;

  @ManyToOne(() => CourseCatalogEntity)
  @JoinColumn()
  catalog: CourseCatalogEntity;
}
