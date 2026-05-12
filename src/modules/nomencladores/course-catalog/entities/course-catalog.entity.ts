import { BaseEntity } from 'src/config';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CourseCatalogEntity extends BaseEntity{
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({nullable: true})
  image: string;
}
