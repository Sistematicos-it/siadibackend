import { BaseEntity } from '../../../../config/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ParishEntity } from './parish.entity';
import { WorkOrderEntity } from 'src/modules/work-order/entities/work-order.entity';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';


@Entity({ name: 'address' })
export class AddressEntity extends BaseEntity {
  
  @Column()
  description: string;

  @Column({nullable: true})
  mainStreet?: string;

  @Column({nullable: true})
  secondaryStreet?: string;

  @Column({nullable: true})
  postalCode?: number;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @ManyToOne(() => ParishEntity, parish => parish.addresses)
  parish: ParishEntity;

  @OneToMany(() => WorkOrderEntity, workOrder => workOrder.address, {nullable: true})
  @JoinColumn()
  workOrder: WorkOrderEntity[];
  
  @OneToMany(() => PlanningEntity, planning => planning.sourceAddress, {nullable: true})
  @JoinColumn()
  planningSource: PlanningEntity[];

  @OneToMany(() => PlanningEntity, planning => planning.destinationAddress, {nullable: true})
  @JoinColumn()
  planningDestination: PlanningEntity[];

}