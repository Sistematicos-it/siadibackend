import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    WITH datos AS (
      SELECT
        date_part('year', v.date)::int AS anno,
        date_part('month', v.date)::int AS mes,
        v.point_id,
        c.id AS citizen_id,
        c.gender AS genero,
        date_part('year', age(TO_DATE(c.birth_date, 'YYYY-MM-DD')))::int AS edad
      FROM visit_record v
      LEFT JOIN citizen c ON v.citizen_id = c.id
      JOIN point p ON p.id = c.point_id
      WHERE p.deleted_at IS NULL
    ),
    visitas_totales AS (
      SELECT
        d.anno,
        d.mes,
        d.point_id,
        COUNT(*) AS total_visitas
      FROM datos d
      GROUP BY d.anno, d.mes, d.point_id
    ),
    categorias AS (
      SELECT
        d.anno,
        d.mes,
        d.point_id,
        CASE
          WHEN d.genero = 'F' AND d.edad < 18 THEN 'Menor de edad mujeres'
          WHEN d.genero = 'F' AND d.edad >= 18 THEN 'Mayor de edad mujeres'
          WHEN d.genero = 'M' AND d.edad < 18 THEN 'Menor de edad hombres'
          WHEN d.genero = 'M' AND d.edad >= 18 THEN 'Mayor de edad hombres'
          -- Agrega más casos para las otras categorías...
        END AS denominacion,
        COUNT(*) AS cantidad
      FROM datos d
      GROUP BY d.anno, d.mes, d.point_id, denominacion
    )
    SELECT
      c.anno,
      c.mes,
      c.point_id,
      c.denominacion,
      c.cantidad,
      vt.total_visitas
    FROM categorias c
    LEFT JOIN visitas_totales vt ON c.anno = vt.anno AND c.mes = vt.mes AND c.point_id = vt.point_id
  `,
})
export class TotalVisitantesPorRangoEdadEntity {
  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  denominacion: string;

  @ViewColumn()
  cantidad: number;

  @ViewColumn()
  total_visitas: number;
}
