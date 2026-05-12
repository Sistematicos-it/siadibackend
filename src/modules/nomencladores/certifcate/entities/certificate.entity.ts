import { BaseEntity } from 'src/config';
import { ICertificate } from '../interfaces/certificate.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'certificate' })
export class CertificateEntity extends BaseEntity implements ICertificate {
  @Column()
  name: string;

  @Column({ nullable: true })
  file?: string;
}
