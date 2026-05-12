import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'courses_list_geolocation_view_entity',
  expression: `SELECT C.name as name, Date(C.start_date) as start_date, Date(C.end_date) as end_date , 
	PA.id as parish_id, PA.name as parish_name, CA.id as canton_id, CA.name as canton_name, 
	PR.id as province_id, PR.name as province_name
	FROM course C INNER JOIN point PD on (C.point_id=PD.id)
	INNER JOIN address AD on (PD.address_id=AD.id)
	INNER JOIN parish PA on (AD.parish_id=PA.id) 
	INNER JOIN canton CA on (PA.canton_id=CA.id)
	INNER JOIN province PR on (CA.province_id=PR.id)
	where C.deleted_at IS NULL `,
  
})
export class CoursesListGeolocationViewEntity {

  @ViewColumn()
  name: string;

  @ViewColumn()
  start_date: Date;

  @ViewColumn()
  end_date: Date;

  @ViewColumn()
  parish_id: string;
  
  @ViewColumn()
  parish_name: string;

  @ViewColumn()
  canton_id: string;

  @ViewColumn()
  canton_name: string;

  @ViewColumn()
  province_id: string;

  @ViewColumn()
  province_name: string;
}
