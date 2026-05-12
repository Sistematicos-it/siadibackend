import { ViewEntity, ViewColumn, Column } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT
      COUNT(CASE WHEN solved_date IS NULL AND closed_date IS NULL THEN 1 END) AS value,
      'Activo' AS name
    FROM incident
    UNION ALL
    SELECT
      COUNT(CASE WHEN solved_date IS NOT NULL OR closed_date IS NOT NULL THEN 1 END) AS value,
      'Inactivo' AS name
    FROM incident
  `,
})
export class TotalIncidentsByStatusViewEntity {
  @ViewColumn()
  @Column('int') // Especifica el tipo de datos como entero (int)
  value: number;

  @ViewColumn()
  name: string;
}
