import { UNIT_OF_TIME } from 'src/constants/enums';
import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';
import { PermissionRequestEntity } from 'src/modules/permissionRequest/entities/permission-request.entity';

@Entity({ name: 'permission_type' })
export class PermissionTypeEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  maxiTimeAllowed: number;

  @Column({
    type: 'enum',
    enum: UNIT_OF_TIME,
    default: UNIT_OF_TIME.HOURS,
  })
  unitTime: UNIT_OF_TIME;

  @Column()
  slug: string;

  @OneToMany(() => PermissionRequestEntity, pr => pr.permissionType, {nullable: true})
  @JoinColumn()
  permissionRequest: PermissionRequestEntity[];
}