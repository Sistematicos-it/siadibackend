import { BaseEntity } from 'src/config';
import { IFaceToFaceTraining } from '../interfaces/face-to-face-training.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { FileEntity } from 'src/modules/file/entities/file.entity';

@Entity({ name: 'face_to_face_training' })
export class FaceToFaceTrainingEntity
  extends BaseEntity
  implements IFaceToFaceTraining
{
  @Column()
  name: string;

  @Column()
  hours: number;

  @Column()
  min_age?: number;

  @Column()
  max_age?: number;

  @Column()
  content?: string;

  @OneToMany(() => FileEntity, file => file.training, {nullable: true, eager: true})
  files: FileEntity[];
}
