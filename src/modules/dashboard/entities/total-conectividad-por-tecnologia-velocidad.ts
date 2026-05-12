import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'total_conectividad_por_tecnologia_velocidad',
  expression: `
    SELECT
      t.name AS technology,
      s.name AS speed,
      COUNT(*) AS total
    FROM conectivity c
    LEFT JOIN technology t ON c.technology_id = t.id
    LEFT JOIN speed s ON c.speed_id = s.id
    GROUP BY t.name, s.name
  `,
})
export class TotalConectividadByTecnologyAndSpeedViewEntity {
  @ViewColumn()
  technology: string;

  @ViewColumn()
  speed: string;

  @ViewColumn()
  total: number;
}

