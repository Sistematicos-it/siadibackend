import { POINT_STATUS } from 'src/constants/enums';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `SELECT DISTINCT
	point_status."name" AS status, 
	parish."name" AS parish_name, 
    parish."id" AS parish_id, 
	canton."name" AS canton_name,
    canton."id" AS canton_id, 
    province."id" AS province_id, 
	province."name" AS province_name, 
	point."id"
FROM
	point
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
	INNER JOIN
	point_status
	ON 
		point.status_id = point_status."id"
		WHERE point.deleted_at IS NULL
    `,

  name: 'point_geolocation_status_entity',
})
export class PointGeolocationStatusEntity {
  @ViewColumn()
  status: POINT_STATUS;

  @ViewColumn()
  parish_name: string;

  @ViewColumn()
  parish_id: string;
  @ViewColumn()
  canton_name: string;
  @ViewColumn()
  province_name: string;
  @ViewColumn()
  id: string;

  @ViewColumn()
  canton_id: string;

  @ViewColumn()
  province_id: string;
}
