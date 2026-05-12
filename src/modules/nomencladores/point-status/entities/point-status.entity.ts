import { BaseEntity } from 'src/config';
import { IPointStatus } from '../interfaces/point-status.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "point_status"})
export class PointStatusEntity extends BaseEntity implements IPointStatus {
  @Column()
  name: string;
}
