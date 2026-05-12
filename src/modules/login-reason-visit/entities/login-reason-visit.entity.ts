import { BaseEntity } from 'src/config';
import { ILoginReasonOfVisit } from '../interfaces/login-reason-visit.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'login_reason_visit' })
export class LoginReasonOfVisitEntity extends BaseEntity implements ILoginReasonOfVisit {
  @Column()
  name: string;

  @Column({nullable: true})
  slug: string;
}
