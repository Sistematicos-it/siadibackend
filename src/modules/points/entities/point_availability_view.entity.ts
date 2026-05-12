import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'point_availability_view_entity',
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
      json_agg(di.*) as disconnection_incidents, -- Nueva columna como JSON array
      co.monthly_value as monthly_fee_pde,
      NULL as value_to_pay,
      NULL as discount_of_unavailability,
      NULL as sub_total_monthly_fee_pde,
      s.name as speed
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
      LEFT JOIN disconnection_incident di ON p.id = di.point_id -- Relación con disconnection_incident
      LEFT JOIN speed s ON co.speed_id = s.id

      WHERE p.deleted_at IS NULL
    GROUP BY p.id, cy.name, r.name, pr.name, c.name, pa.name, t.name, co.monthly_value, s.name
  `,
})
export class PointAvailabilityViewEntity {
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
  disconnection_incidents: any[]; // Nueva columna como JSON array

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
