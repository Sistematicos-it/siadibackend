import { BaseEntity } from 'src/config';
import { IReasonForVisit } from '../interfaces/website.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { ServiceEntity } from './service.entity';

@Entity({name: "reason_for_visit"})
export class ReasonForVisitEntity extends BaseEntity implements IReasonForVisit {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => ServiceEntity, service => service.categorie, {nullable: true })
  services: ServiceEntity[];

}
