// asset-status-by-type-and-status.entity.ts
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT
      t.name AS asset_type,
      s.status,
      COALESCE(count, 0) AS count
    FROM (
      SELECT unnest(ARRAY['Funcional', 'No Funcional', 'Funcional con deficiencias', 'Operativo', 'No Operativo', 'Operativo con deficiencias']) AS status
    ) s
    CROSS JOIN asset_type t
    LEFT JOIN (
      SELECT
        type.name AS asset_type,
        a.status,
        COUNT(*) AS count
      FROM asset a
      JOIN asset_type type ON a.type_id = type.id
      GROUP BY type.name, a.status
    ) stats ON t.name = stats.asset_type AND s.status = stats.status
    ORDER BY t.name, s.status;
  `,
})
export class AssetStatusByTypeAndStatusViewEntity {
  @ViewColumn()
  asset_type: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  count: number;
}
