import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'total_visitantes_por_provincias',
  expression: `
    SELECT
      date_part('year', v_1.date)::int AS anno,
      date_part('month', v_1.date)::int AS mes,
      v_1.point_id,
      pp.name AS provincia,
      vt.name AS tipo_visita,
      count(*) AS cantidad
    FROM visit_record v_1
    LEFT JOIN visit_type vt ON v_1.visit_type_id = vt.id
    LEFT JOIN point p ON v_1.point_id = p.id
    LEFT JOIN address a ON p.address_id = a.id
    LEFT JOIN parish pa ON a.parish_id = pa.id
    LEFT JOIN canton c ON pa.canton_id = c.id
    LEFT JOIN province pp ON c.province_id = pp.id
    WHERE p.deleted_at IS NULL
    GROUP BY pp.name, vt.name, mes, anno, point_id
  `,
})
export class TotalVisitantesPorProvinciasViewEntity {
  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  provincia: string;

  @ViewColumn()
  tipo_visita: string;

  @ViewColumn()
  cantidad: number;
}
