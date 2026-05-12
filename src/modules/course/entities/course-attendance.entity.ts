import { BaseEntity } from 'src/config';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity({ name: 'course_attendance' })
export class CourseAttendanceEntity extends BaseEntity {
  

  @ManyToOne(() => CitizenEntity)
  @JoinColumn()
  citizen: CitizenEntity;

  @ManyToOne(() => CourseEntity)
  @JoinColumn()
  course: CourseEntity;
}
