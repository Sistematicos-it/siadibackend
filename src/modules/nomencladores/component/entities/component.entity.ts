import { BaseEntity } from 'src/config';
import { IComponent } from '../interfaces/component.interface';
import { Column, Entity, ManyToMany } from 'typeorm';
import { PlanningEntity } from 'src/modules/planning/entities/planning.entity';

@Entity({name: "component"})
export class ComponentEntity extends BaseEntity implements IComponent {
  @Column()
  name: string;

  @ManyToMany(() => PlanningEntity, (planning) => planning.components, {nullable: true})
  planning: PlanningEntity[];
}
