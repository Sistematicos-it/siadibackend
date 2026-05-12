import { BaseEntity } from 'src/config';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IIncidentLogs } from '../interfaces/incident.interface';
import { IncidentEntity } from './incident.entity';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';

@Entity({ name: 'incident_asset' })
export class IncidentAssetsEntity extends BaseEntity {
  @ManyToOne(() => IncidentEntity)
  @JoinColumn()
  incident: IncidentEntity;

  @ManyToOne(() => AssetEntity)
  @JoinColumn()
  asset: AssetEntity;
}
