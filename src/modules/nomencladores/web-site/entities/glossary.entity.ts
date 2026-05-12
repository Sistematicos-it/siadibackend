import { BaseEntity } from 'src/config';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GlossaryEntity extends BaseEntity{
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({nullable: true})
  image: string;
}
