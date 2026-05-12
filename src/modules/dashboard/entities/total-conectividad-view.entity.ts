import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT date_part('year'::text, c_1.date)::int  AS anno,
           date_part('month'::text, c_1.date)::int AS mes,
           point_id,
           t.name                             AS tecnologia,
           s.name                             AS velocidad,
           count(*)                           AS cantidad
    FROM conectivity c_1
             JOIN technology t ON c_1.technology_id = t.id
             JOIN speed s ON c_1.speed_id = s.id
    GROUP BY anno, mes, point_id, t.name, s.name
  `,
})
export class TotalConectividadViewEntity {
  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  tecnologia: string;

  @ViewColumn()
  velocidad: string;

  @ViewColumn()
  cantidad: number;
}
