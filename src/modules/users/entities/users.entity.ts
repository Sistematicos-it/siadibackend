import { BaseEntity } from '../../../config/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { IUser } from '../interfaces/user.interface';
import { ROLES } from 'src/constants';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';

import { UserRolesEntity } from './users-roles.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity implements IUser {
  @Column({ nullable: true }) //Son unicos para hacer la autenticacion de usuarios
  email?: string;

  @Column({ unique: true }) //Son unicos para hacer la autenticacion de usuarios
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true, default: false })
  isFirstTime: boolean;

  @ManyToOne(() => RoleEntity)
  @JoinColumn()
  role: RoleEntity;

  @OneToMany(() => UserRolesEntity, (userRoles) => userRoles.user)
  userRoles?: UserRolesEntity[];

  @OneToOne(() => EmployeeEntity, (employee) => employee.user)
  employee?: EmployeeEntity;
}
