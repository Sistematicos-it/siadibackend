import { BaseEntity } from 'src/config';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'service_status' })
export class ServiceStatusEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;
}
