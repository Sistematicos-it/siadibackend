import { ethnicity } from 'src/modules/citizen/interfaces/citizen.interface';
import { GENDERS } from 'src/modules/employee/interfaces/employee.interface';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `SELECT DISTINCT
  point."name" AS point_name, 
  citizen.is_pregnant, 
  citizen.has_under_age_kids, 
  citizen.gender, 
  citizen.birth_date, 
  citizen.ethnicity, 
  point."id" AS point_id
FROM
  visit_record
  INNER JOIN
  citizen
  ON 
      visit_record.citizen_id = citizen."id"
  INNER JOIN
  point
  ON 
      visit_record.point_id = point."id"
  WHERE point.deleted_at IS NULL
  `,
  name: 'visit_record_view'
})
export class VisitRecordView {
  @ViewColumn()
  point_name: string;

  @ViewColumn()
  is_pregnant: boolean;

  @ViewColumn()
  has_under_age_kids: boolean;

  @ViewColumn()
  gender: GENDERS;

  @ViewColumn()
  birth_date: string;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  ethnicity: ethnicity;
}
