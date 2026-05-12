import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PointEntity } from 'src/modules/points/entities/point.entity';

@Entity({name: "report_connection_logs"})
export class ReportConnectionLogsEntity extends BaseEntity {
  @Column({nullable: true})
  code_pde: string;

  @Column({nullable: true})
  country_pde: string;

  @Column({nullable: true})
  region_pde: string;

  @Column({nullable: true})
  province_pde: string;

  @Column({nullable: true})
  canton_pde: string;

  @Column({nullable: true})
  parish_pde: string;

  @Column({nullable: true})
  name_pde: string;

  @Column({nullable: true})
  connectivity: string;

  @Column({nullable: true})
  type: string;

  @Column({nullable: true})
  tman: number;

  @Column({nullable: true})
  tmov: number;

  @Column({nullable: true})
  tfault: number;

  @Column({nullable: true})
  tpen: number;

  @Column({nullable: true})
  ti: number;

  @Column({nullable: true})
  fcs: number;

  @Column({nullable: true})
  tm: number;

  @Column({nullable: true})
  tt: number;

  @Column({nullable: true})
  d: number;

  //tarifa del mes
  @Column({nullable: true})
  monthlyFee_pde: number

  //Valor a pagar
  @Column({nullable: true})
  valueToPay: number

  //descuento de indisponivilidad
  @Column({nullable: true})
  discountOfUnavailability: number

  //subtotal tarifa del mes
  @Column({nullable: true})
  subTotalMonthlyFee_pde: number

  @ManyToOne(() => PointEntity, (point) => point.conecctionsLogs, { nullable: true })
  @JoinColumn()
  point: PointEntity;
}
