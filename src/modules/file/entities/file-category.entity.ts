import { BaseEntity } from 'src/config';
import { Column, Entity, JoinTable, OneToMany } from 'typeorm';
import { IFileCategory } from '../interfaces/file-category.interface';
import { FileEntity } from './file.entity';

@Entity({name: "file_category"})
export class FileCategoryEntity extends BaseEntity implements IFileCategory {
  @Column()
  name: string;

  @Column({nullable: true})
  slug: string;

  @OneToMany(() => FileEntity, file => file.fileCategory, {nullable: true})
  files: FileEntity[];
}
