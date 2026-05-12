import { BaseEntity } from 'src/config';
import { IPoliticalLine } from '../interfaces/political-line.interface';
import { Column, Entity } from 'typeorm';

@Entity({name: "political_line"})
export class PoliticalLineEntity extends BaseEntity implements IPoliticalLine {
  @Column()
  name: string;
}
