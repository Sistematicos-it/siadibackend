import { BaseEntity } from 'src/config';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { LoginReasonOfVisitEntity } from './login-reason-visit.entity';

@Entity({ name: 'user_login_reason_visit' })
export class UserLoginReasonOfVisitEntity extends BaseEntity {
  @ManyToOne(() => CitizenEntity, {nullable: true})
  @JoinColumn()
  citizen: CitizenEntity;

  @ManyToOne(() => LoginReasonOfVisitEntity,{nullable: true})
  @JoinColumn()
  loginReazonOfVisit: LoginReasonOfVisitEntity;
}
