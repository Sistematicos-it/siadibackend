import { BaseEntity } from 'src/config';
import { IEquipment } from '../interfaces/equipment.interface';
import { Column, Entity, ManyToMany } from 'typeorm';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';

@Entity({name: "equipment"})
export class EquipmentEntity extends BaseEntity implements IEquipment {
  @Column()
  name: string;

  @ManyToMany(() => PlanningEntity, (planning) => planning.equipments, {nullable: true})
  planning: PlanningEntity[];
}
