import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    WITH total_por_genero AS (
      SELECT
        date_part('year'::text, v_1.date)::int AS anno,
        date_part('month'::text, v_1.date)::int AS mes,
        v_1.point_id AS point_id,
        v_1.citizen_id AS citizen_id,
        c.gender AS genero,
        count(*) as total_genero
      FROM citizen c
      JOIN point p ON p.id = c.point_id
      JOIN visit_record v_1 ON v_1.citizen_id = c.id
      WHERE p.deleted_at IS NULL
      GROUP BY anno, mes, v_1.point_id, v_1.citizen_id, genero
    )
    SELECT
      tpg.anno,
      tpg.mes,
      tpg.point_id,
      tpg.genero,
      tpg.total_genero AS cantidad,
      sum(tpg.total_genero) OVER (PARTITION BY tpg.anno, tpg.mes, tpg.point_id) AS total_visitantes
    FROM total_por_genero tpg;
  `,
  name: 'total_visitantes_por_genero',
})
export class TotalVisitantesPorGeneroEntity {
  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  genero: string;

  @ViewColumn()
  cantidad: number;

  @ViewColumn()
  total_visitantes: number;
}





// import { ViewEntity, ViewColumn } from 'typeorm';

// @ViewEntity({
//   expression: `
//     SELECT
//       anno,
//       mes,
//       point_id,
//       genero,
//       count(*) as cantidad
//     FROM (
//       SELECT DISTINCT
//         date_part('year'::text, v_1.date)::int AS anno,
//         date_part('month'::text, v_1.date)::int AS mes,
//         v_1.point_id,
//         c.id,
//         c.gender AS genero
//       FROM citizen c
//       JOIN visit_record v_1 ON v_1.citizen_id = c.id
//     ) t
//     GROUP BY anno, mes, point_id, genero;
//   `,
//   name: 'total_visitantes_por_genero', // Nombre de la vista en la base de datos
// })
// export class TotalVisitantesPorGeneroEntity {
//   @ViewColumn()
//   anno: number;

//   @ViewColumn()
//   mes: number;

//   @ViewColumn()
//   point_id: string;

//   @ViewColumn()
//   genero: string;

//   @ViewColumn()
//   cantidad: number;
// }
