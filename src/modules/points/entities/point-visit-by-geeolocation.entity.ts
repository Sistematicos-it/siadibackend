import { POINT_STATUS } from 'src/constants/enums';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `SELECT
  visit_record.citizen_id, 
  visit_type."name" AS visit_type, 
  parish."name" AS parish_name, 
  parish."id" AS parish_id, 
  canton."name" AS canton_name, 
  canton."id" AS canton_id, 
  province."name" AS province_name, 
  province."id" AS province_id, 
  visit_record.point_id
FROM
  visit_record
  INNER JOIN
  point
  ON 
      visit_record.point_id = point."id"
  INNER JOIN
  visit_type
  ON 
      visit_record.visit_type_id = visit_type."id"
  INNER JOIN
  address
  ON 
      point.address_id = address."id"
  INNER JOIN
  parish
  ON 
      address.parish_id = parish."id"
  INNER JOIN
  canton
  ON 
      parish.canton_id = canton."id"
  INNER JOIN
  province
  ON 
      canton.province_id = province."id"

      WHERE point.deleted_at IS NULL
    `,
})
export class PointGeolocationVisitsEntity {
  @ViewColumn()
  citizen_id: string;

  @ViewColumn()
  province_id: string

  @ViewColumn()
  visit_type: string;

  @ViewColumn()
  parish_name: string;
  @ViewColumn()
  canton_name: string;
  @ViewColumn()
  province_name: string;
  @ViewColumn()
  point_id: string;
}
