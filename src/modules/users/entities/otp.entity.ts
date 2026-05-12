import { BaseEntity } from 'src/config';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OtpCodeEntity extends BaseEntity{

  @Column()
  email: string;

  @Column()
  otpCode: string;
}
