import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ISecurity, SECURITY_ACTION } from '../interfaces/security.interface';
import { UserEntity } from 'src/modules/users/entities/users.entity';

@Entity({ name: 'security_logs' })
export class SecurityLogsEntity extends BaseEntity implements ISecurity {
  @Column({ type: 'enum', enum: SECURITY_ACTION })
  action: SECURITY_ACTION;

  @Column({ type: 'timestamp with time zone', precision: 3 })
  made_on: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  made_by: UserEntity;

  @Column({ nullable: true })
  entity?: string;

  @Column({ type: 'uuid', nullable: true })
  entry_id?: string;

  @Column({nullable: true})
  ip?:string
}
