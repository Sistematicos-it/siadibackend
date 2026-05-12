import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT t.name AS tipo,
           count(*) AS cantidad
    FROM asset a
             JOIN asset_type t ON a.type_id = t.id
    GROUP BY t.name;
  `,
})
export class TotalBienesPorTipoViewEntity {
  @ViewColumn()
  tipo: string;

  @ViewColumn()
  cantidad: number;
}
