// import { ViewEntity, ViewColumn } from 'typeorm';

// @ViewEntity({
//   name: 'point_calculations_availability_view',
//   expression: `
//     SELECT
//       p.id as id,
//       p.code as code_pde,
//       a.description as country_pde,
//       r.name as region_pde,
//       pr.name as province_pde,
//       c.name as canton_pde,
//       pa.name as parish_pde,
//       p.name as name_pde,
//       t.name as connectivity,
//       co.monthly_value as monthly_fee_pde
//     FROM
//       point p
//       LEFT JOIN address a ON p.address_id = a.id
//       LEFT JOIN parish pa ON a.parish_id = pa.id
//       LEFT JOIN canton c ON pa.canton_id = c.id
//       LEFT JOIN province pr ON c.province_id = pr.id
//       LEFT JOIN region r ON pr.region_id = r.id
//       LEFT JOIN conectivity co ON p.id = co.point_id
//       LEFT JOIN technology t ON co.technology_id = t.id
//   `,
// })
// export class PointCalculationsAvailabilityViewEntity {
//   @ViewColumn()
//   id: string;

//   @ViewColumn()
//   code_pde: string;

//   @ViewColumn()
//   country_pde: string;

//   @ViewColumn()
//   region_pde: string;

//   @ViewColumn()
//   province_pde: string;

//   @ViewColumn()
//   canton_pde: string;

//   @ViewColumn()
//   parish_pde: string;

//   @ViewColumn()
//   name_pde: string;

//   @ViewColumn()
//   connectivity: string;

//   @ViewColumn()
//   monthly_fee_pde: number;
// }


import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'point_calculations_availability_view_entity',
  expression: `
  SELECT
  p.id as id,
  p.code as code_pde,
  cy.name as country_pde,
  r.name as region_pde,
  pr.name as province_pde,
  c.name as canton_pde,
  pa.name as parish_pde,
  p.name as name_pde,
  t.name as connectivity,
  NULL as tman,
  NULL as tmov,
  NULL as tfault,
  NULL as tpen,
  CASE
    WHEN di_count = 0 THEN 100
    ELSE (1 - ((ti)/(24*60*60*di_count))) * 100
  END as d,
  ti as ti,
  CASE
    WHEN (1 - ((ti)/(24*60*60*di_count))) <= 100 AND (1 - ((ti)/(24*60*60*di_count))) >= 99.3 THEN 1
    WHEN (1 - ((ti)/(24*60*60*di_count))) >= 98.7 AND (1 - ((ti)/(24*60*60*di_count))) <= 99.29 THEN 0.98
    WHEN (1 - ((ti)/(24*60*60*di_count))) >= 98.69 AND (1 - ((ti)/(24*60*60*di_count))) >= 92.3 THEN 0.92
    WHEN (1 - ((ti)/(24*60*60*di_count))) <= 92.29 AND (1 - ((ti)/(24*60*60*di_count))) >= 74.2 THEN 74.2
    ELSE 0
  END as fcs,
  NULL as tm,
  CASE
    WHEN EXTRACT(DAY FROM CURRENT_DATE) = 31 THEN 744
    WHEN EXTRACT(DAY FROM CURRENT_DATE) = 30 THEN 720
    WHEN EXTRACT(DAY FROM CURRENT_DATE) = 29 THEN 696
    ELSE 672
  END as tt,
  co.monthly_value as monthly_fee_pde, -- Cambio aquí
  NULL as value_to_pay,
  NULL as discount_of_unavailability,
  NULL as sub_total_monthly_fee_pde,
  s.name as speed -- Agregar la columna de speed
FROM
  point p
  LEFT JOIN address a ON p.address_id = a.id
  LEFT JOIN parish pa ON a.parish_id = pa.id
  LEFT JOIN canton c ON pa.canton_id = c.id
  LEFT JOIN province pr ON c.province_id = pr.id
  LEFT JOIN region r ON pr.region_id = r.id
  LEFT JOIN country cy ON r.country_id = cy.id
  LEFT JOIN conectivity co ON p.id = co.point_id
  LEFT JOIN technology t ON co.technology_id = t.id
  LEFT JOIN (
    SELECT point_id, SUM(EXTRACT(epoch FROM (di.closed_date - di.created_at))) as ti, COUNT(di.id) as di_count
    FROM disconnection_incident di
    GROUP BY point_id
  ) di_agg ON p.id = di_agg.point_id
  LEFT JOIN speed s ON co.speed_id = s.id -- Relación con Speed
  WHERE p.deleted_at IS NULL
`,
})
export class PointCalculationsAvailabilityViewEntity {
  @ViewColumn()
  id: string;

  @ViewColumn()
  code_pde: string;

  @ViewColumn()
  country_pde: string;

  @ViewColumn()
  region_pde: string;

  @ViewColumn()
  province_pde: string;

  @ViewColumn()
  canton_pde: string;

  @ViewColumn()
  parish_pde: string;

  @ViewColumn()
  name_pde: string;

  @ViewColumn()
  connectivity: string;

  @ViewColumn()
  tman: number;

  @ViewColumn()
  tmov: number;

  @ViewColumn()
  tfault: number;

  @ViewColumn()
  tpen: number;

  @ViewColumn()
  d: number;

  @ViewColumn()
  ti: number;

  @ViewColumn()
  fcs: number;

  @ViewColumn()
  tm: number;

  @ViewColumn()
  tt: number;

  @ViewColumn()
  monthly_fee_pde: number;

  @ViewColumn()
  value_to_pay: number;

  @ViewColumn()
  discount_of_unavailability: number;

  @ViewColumn()
  sub_total_monthly_fee_pde: number;

  @ViewColumn()
  speed: string;
}
