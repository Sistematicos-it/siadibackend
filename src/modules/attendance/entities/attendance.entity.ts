import { BaseEntity } from 'src/config';
import { IAttendance } from '../interfaces/attendance.interface';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TYPE_OF_ATTENDANCE } from 'src/constants/enums';
import { UserEntity } from 'src/modules/users/entities/users.entity';

@Entity({name: "attendance"})
export class AttendanceEntity extends BaseEntity implements IAttendance {
  
  @Column({ type: 'enum', enum: TYPE_OF_ATTENDANCE })
  attendanceType: TYPE_OF_ATTENDANCE;

  @Column({ type: 'timestamp', precision: 3 })
  attendanceDate: Date;

  @Column({nullable: true})
  ip?: string

  @Column({nullable: true})
  observation?: string

  @Column({nullable: true, default: false})
  isInPoint?: boolean

  @ManyToOne(()=> UserEntity, {nullable: true})
  @JoinColumn()
  user: UserEntity
}
