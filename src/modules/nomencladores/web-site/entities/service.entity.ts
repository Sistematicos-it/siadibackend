import { BaseEntity } from 'src/config';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ReasonForVisitEntity } from './reason-for-visit.entity';

@Entity()
export class ServiceEntity extends BaseEntity{
  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column({nullable: true})
  image: string;

  @Column({nullable: true})
  coverImage: string;

  @ManyToOne(() => ReasonForVisitEntity, reason => reason.services, {nullable: true })
  categorie: ReasonForVisitEntity;
}
