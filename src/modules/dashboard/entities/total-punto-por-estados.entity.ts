import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT
      ps.name AS status_name,
      COUNT(p.id) AS count
    FROM
      point p
    LEFT JOIN
      point_status ps ON p.status_id = ps.id
      WHERE p.deleted_at IS NULL
    GROUP BY
      ps.name;
  `,
})
export class TotalPointsByStatusView {
  @ViewColumn()
  status_name: string;

  @ViewColumn()
  count: number;
}
