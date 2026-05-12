import { BaseEntity } from '../../../config/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { IUser } from '../interfaces/user.interface';
import { ROLES } from 'src/constants';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';

@Entity({ name: 'users_roles' })
export class UserRolesEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.userRoles)
  @JoinColumn()
  user?: UserEntity;

  @ManyToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;

  @Column({ nullable: true, default: true })
  status: boolean;
  
}
