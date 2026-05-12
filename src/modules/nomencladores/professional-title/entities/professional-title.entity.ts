import { BaseEntity } from 'src/config';
import { Column, Entity } from 'typeorm';
import { IProfessionalTitle } from '../interfaces/professional-title.interface';

@Entity({name: "professional_title"})
export class ProfessionalTitleEntity extends BaseEntity implements IProfessionalTitle {
  @Column()
  name: string;

  @Column()
  slug?: string;
}
