import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
  SELECT 
  date_part('year'::text, v.date)::int AS anno,
  date_part('month'::text, v.date)::int AS mes,
  v.point_id,
  'ON_SITE' AS value,
  COUNT(*) AS cantidad
FROM 
  visit_record v
LEFT JOIN 
  visit_type vt ON v.visit_type_id = vt.id
WHERE 
  vt.value = 'ON_SITE'
GROUP BY 
  anno, mes, v.point_id

UNION ALL

SELECT 
  date_part('year'::text, v.date)::int AS anno,
  date_part('month'::text, v.date)::int AS mes,
  v.point_id,
  'VIRTUAL' AS value,
  COUNT(*) AS cantidad
FROM 
  visit_record v
LEFT JOIN 
  visit_type vt ON v.visit_type_id = vt.id
WHERE 
  vt.value = 'VIRTUAL'
GROUP BY 
  anno, mes, v.point_id

UNION ALL

SELECT 
  date_part('year'::text, v.date)::int AS anno,
  date_part('month'::text, v.date)::int AS mes,
  v.point_id,
  'totalViews' AS value,
  COUNT(*) AS cantidad
FROM 
  visit_record v
GROUP BY 
  anno, mes, v.point_id

UNION ALL

SELECT 
  date_part('year'::text, v.date)::int AS anno,
  date_part('month'::text, v.date)::int AS mes,
  v.point_id,
  'totalVisitors' AS value,
  COUNT(DISTINCT c.id) AS cantidad
FROM 
  citizen c
JOIN 
  visit_record v ON v.citizen_id = c.id
GROUP BY 
  anno, mes, v.point_id;

  `,
})
export class TotalGeneralViewEntity {
  @ViewColumn()
  tipo_visita: string;

  @ViewColumn()
  cantidad: number;

  @ViewColumn()
  anno: number;

  @ViewColumn()
  mes: number;

  @ViewColumn()
  point_id: string;
}


/**
 * SELECT DISTINCT
        date_part('year'::text, v.date)::int AS anno,
        date_part('month'::text, v.date)::int AS mes,
        v.point_id,
        'ON_SITE' AS tipo_visita,
        COALESCE(t1.cantidad, 0) AS cantidad
    FROM visit_record v
    LEFT JOIN (
        SELECT
            date_part('year'::text, vr.date)::int AS anno,
            date_part('month'::text, vr.date)::int AS mes,
            point_id,
            COUNT(*) AS cantidad
        FROM visit_record vr
        JOIN visit_type vt ON vr.visit_type_id = vt.id
        WHERE vt.value = 'ON_SITE'
        GROUP BY point_id, anno, mes
    ) t1 ON v.point_id = t1.point_id AND t1.mes = date_part('month'::text, v.date)::int AND t1.anno = date_part('year'::text, v.date)::int

    UNION ALL

    SELECT DISTINCT
        date_part('year'::text, v.date)::int AS anno,
        date_part('month'::text, v.date)::int AS mes,
        v.point_id,
        'VIRTUAL' AS tipo_visita,
        COALESCE(t2.cantidad, 0) AS cantidad
    FROM visit_record v
    LEFT JOIN (
        SELECT
            date_part('year'::text, vr.date)::int AS anno,
            date_part('month'::text, vr.date)::int AS mes,
            point_id,
            COUNT(*) AS cantidad
        FROM visit_record vr
        JOIN visit_type vt ON vr.visit_type_id = vt.id
        WHERE vt.value = 'VIRTUAL'
        GROUP BY point_id, anno, mes
    ) t2 ON v.point_id = t2.point_id AND t2.mes = date_part('month'::text, v.date)::int AND t2.anno = date_part('year'::text, v.date)::int

    UNION ALL

    SELECT
        date_part('year'::text, date)::int AS anno,
        date_part('month'::text, date)::int AS mes,
        point_id,
        'totalViews' AS tipo_visita,
        COUNT(*) AS cantidad
    FROM visit_record
    GROUP BY anno, mes, point_id

    UNION ALL

    SELECT
        date_part('year'::text, v_1.date)::int AS anno,
        date_part('month'::text, v_1.date)::int AS mes,
        point_id,
        'totalVisitors' AS tipo_visita,
        COUNT(DISTINCT c.id) AS cantidad
    FROM citizen c
    JOIN visit_record v_1 ON v_1.citizen_id = c.id
    GROUP BY anno, mes, point_id;
 */
