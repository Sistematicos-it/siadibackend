import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT
      p.id AS point_id,
      p.name AS point_name,
      ps.id AS status_id,
      ps.name AS status_name,
      pr.id AS province_id,
      pr.name AS province_name,
      reg.id AS region_id,
      reg.name AS region_name,
      c.id AS canton_id,
      c.name AS canton_name,
      pa.id as parish_id,
      pa.name as parish_name
    FROM
      point p
    LEFT JOIN
      point_status ps ON p.status_id = ps.id
    LEFT JOIN
      address a ON p.address_id = a.id
    LEFT JOIN
      parish pa ON a.parish_id = pa.id
    LEFT JOIN
      canton c ON pa.canton_id = c.id
    LEFT JOIN
      province pr ON c.province_id = pr.id
    LEFT JOIN
      region reg ON pr.region_id = reg.id
    WHERE p.deleted_at IS NULL
  `,
  name: 'puntos_de_encuentro_por_provincia_y_estado', // Nombre de la vista en la base de datos
})
export class TotalPuntosDeEncuentroPorProvinciaYEstadoEntity {
  @ViewColumn()
  point_id: number;

  @ViewColumn()
  point_name: string;

  @ViewColumn()
  status_id: number;

  @ViewColumn()
  status_name: string;

  @ViewColumn()
  province_id: number;

  @ViewColumn()
  region_id: string;

  @ViewColumn()
  province_name: string;

  @ViewColumn()
  region_name: string;

  @ViewColumn()
  canton_id: string;

  @ViewColumn()
  canton_name: string;

  @ViewColumn()
  parish_id: string;

  @ViewColumn()
  parish_name: string;
}
