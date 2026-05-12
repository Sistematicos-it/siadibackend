import { BaseEntity } from 'src/config';
import { IProgram } from '../interfaces/program.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CertificateEntity } from '../../certifcate/entities/certificate.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';

@Entity({ name: 'program' })
export class ProgramEntity extends BaseEntity implements IProgram {
  @Column()
  name: string;

  @Column()
  url?: string;

  @Column()
  hours: number;

  @Column()
  min_age?: number;

  @Column()
  max_age?: number;

  @Column()
  content?: string;

  @Column({nullable: true})
  coverImage: string;

  @ManyToOne(() => CertificateEntity)
  @JoinColumn()
  certificate: CertificateEntity;

  @OneToMany(() => FileEntity, (file) => file.program, {eager: true})
  files: FileEntity[];
}
