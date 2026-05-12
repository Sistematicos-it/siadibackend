import { BaseEntity } from 'src/config';
import { IPermission } from '../interfaces/permission-request.interface';
import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PERMISSION_REQUEST_STATUS, UNIT_OF_TIME } from 'src/constants/enums';
import { PermissionTypeEntity } from 'src/modules/nomencladores/permissions-data/entities/permissions-types.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';


@Entity({ name: 'permission_request' })
export class PermissionRequestEntity extends BaseEntity implements IPermission {

  @Column()
  @Generated('increment')
  permission_number: number;

  @Column({ nullable: true, type: 'timestamp with time zone' , precision: 3})
  start_date?: Date;

  @Column({nullable: true, type: 'timestamp with time zone' , precision: 3})
  end_date?: Date;

  @Column()
  time: number;

  @Column({
    type: 'enum',
    enum: UNIT_OF_TIME,
    default: UNIT_OF_TIME.HOURS,
  })
  unitTime: UNIT_OF_TIME;

  @Column({
    type: 'enum',
    enum: PERMISSION_REQUEST_STATUS,
    default: PERMISSION_REQUEST_STATUS.DRAFT,
  })
  status: PERMISSION_REQUEST_STATUS;

  @Column()
  observation: string

  @ManyToOne(() => PermissionTypeEntity, permission => permission.permissionRequest, {nullable: true})
  @JoinColumn()
  permissionType: PermissionTypeEntity;

  @OneToMany(() => FileEntity, file => file.permissionRequest, {nullable: true})
  files: FileEntity[];

  @ManyToOne(()=> UserEntity, {nullable: true})
  @JoinColumn()
  user?: UserEntity
}
