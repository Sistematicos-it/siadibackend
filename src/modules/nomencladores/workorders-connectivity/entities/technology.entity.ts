import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'technology' })
export class TechnologyEntity extends BaseEntity {
  
  @Column({unique: true })
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => WorkOrderEntity, workOrder => workOrder.technology, {nullable: true})
  workOrder: WorkOrderEntity[];

}