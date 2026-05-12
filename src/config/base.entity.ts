import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';



export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' , precision: 3})
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' , precision: 3})
  updatedAt: Date;
  
  @DeleteDateColumn({ type: 'timestamp with time zone' , precision: 3})
  deletedAt?: Date;
}
