import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
  SELECT point.id AS point_id,
  point.name AS point_name,
  visit_record.visit_type_id,
  visit_type.value AS visit_type_value,
  visit_record.id AS visit_id,
  visit_record.date AS visit_date
 FROM point
   LEFT JOIN visit_record ON point.id = visit_record.point_id
   LEFT JOIN visit_type ON visit_record.visit_type_id = visit_type.id
   WHERE point.deleted_at IS NULL
  `,
})
export class PointVisitsEntity {
  @ViewColumn()
  point_id: string;

  @ViewColumn()
  point_name: string;

  @ViewColumn()
  visit_type_id: string;

  @ViewColumn()
  visit_type_value: string;

  @ViewColumn()
  visit_id: string;

  @ViewColumn()
  visit_date: string;
}
