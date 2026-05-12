import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    WITH visitantes_etnia AS (
      SELECT
        date_part('year', v.date)::int AS anno,
        date_part('month', v.date)::int AS mes,
        date_part('day', v.date)::int AS dia,
        v.point_id AS point_id_ve,
        c.id,
        c.ethnicity AS etnia
      FROM citizen c
      JOIN point p ON p.id = c.point_id
      JOIN visit_record v ON v.citizen_id = c.id
      WHERE p.deleted_at IS NULL
    ),
    totales_por_etnia AS (
      SELECT
        date_part('year', v2.date)::int AS anno,
        date_part('month', v2.date)::int AS mes,
        date_part('day', v2.date)::int AS dia,
        v2.point_id AS point_id_totals,
        c2.ethnicity AS etnia,
        count(*) AS total_visitas_etnia
      FROM citizen c2
      JOIN visit_record v2 ON v2.citizen_id = c2.id
      GROUP BY anno, mes, dia, point_id_totals, etnia
    )
    SELECT
      ve.anno,
      ve.mes,
      ve.dia,
      ve.point_id_ve AS point_id,
      ve.etnia,
      count(*) AS cantidad,
      COALESCE(totales.total_visitas_etnia, 0) AS total_visitas_etnia
    FROM visitantes_etnia ve
    LEFT JOIN totales_por_etnia totales ON ve.anno = totales.anno
    AND ve.mes = totales.mes
    AND ve.dia = totales.dia
    AND ve.point_id_ve = totales.point_id_totals
    AND ve.etnia = totales.etnia
    GROUP BY ve.anno, ve.mes, ve.dia, ve.point_id_ve, ve.etnia, totales.total_visitas_etnia;
  `,
})
export class TotalVisitantesPorEtniaEntity {
  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  dia: number;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  etnia: string;

  @ViewColumn()
  cantidad: number;

  @ViewColumn()
  total_visitas_etnia: number;
}




// import { ViewEntity, ViewColumn } from 'typeorm';

// @ViewEntity({
//   expression: `
//     SELECT
//       anno,
//       mes,
//       point_id,
//       etnia,
//       count(*) as cantidad
//     FROM (
//       SELECT DISTINCT
//         date_part('year'::text, v_1.date)::int AS anno,
//         date_part('month'::text, v_1.date)::int AS mes,
//         v_1.point_id,
//         c.id,
//         c.ethnicity as etnia
//       FROM citizen c
//       JOIN visit_record v_1 ON v_1.citizen_id = c.id
//     ) AS t
//     GROUP BY anno, mes, point_id, etnia;
//   `,
// })
// export class TotalVisitantesPorEtniaEntity {
//   @ViewColumn()
//   anno: number;

//   @ViewColumn()
//   mes: number;

//   @ViewColumn()
//   point_id: string;

//   @ViewColumn()
//   etnia: string;

//   @ViewColumn()
//   cantidad: number;
// }
