import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'sharing' })
export class SharingEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => WorkOrderEntity, workOrder => workOrder.sharing, {nullable: true})
  workOrder: WorkOrderEntity[];

}