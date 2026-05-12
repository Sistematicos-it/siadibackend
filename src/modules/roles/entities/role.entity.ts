import { BaseEntity } from 'src/config';
import { Column, Entity } from 'typeorm';
import { IRoles } from '../interfaces/role.interface';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEntity implements IRoles {
  @Column()
  role_name: string;

  @Column()
  role_value: string;
}
