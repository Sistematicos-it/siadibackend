import { Column, Entity, ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'total_visits_and_trainings_by_province_view_entity',
  expression: `
    SELECT  p.id AS province_id, p.name AS province_name,
            cn.id AS canton_id,  cn.name AS canton_name,
            vt.id AS type_id, vt.name AS type_name,
	          count(case when vt.value='VISIT' then vr.id else null end) as total_visits,
            count(case when vt.value='ON_SITE' then vr.id else null end) as total_capacitations,
  	        count(case when vt.value='VIRTUAL' then vr.id else null end) as total_virtual_visits  	
    FROM visit_record vr JOIN visit_type vt on visit_type_id=vt.id
    JOIN point pt ON vr.point_id = pt.id
    JOIN address a ON pt.address_id = a.id
    JOIN parish pa ON a.parish_id = pa.id
    JOIN canton cn ON pa.canton_id = cn.id
    JOIN province p ON cn.province_id = p.id   
    GROUP BY p.id, p.name, cn.id, cn.name, vt.id, vt.name;
  `,
})
export class TotalVisitsAndTrainingsByProvinceViewEntity {
  @ViewColumn()
  province_id: string;

  @ViewColumn()
  province_name: string;

  @ViewColumn()
  canton_id: string;

  @ViewColumn()
  canton_name: string;

  @ViewColumn()
  type_id: string;

  @ViewColumn()
  type_name: string;

  @ViewColumn()
  total_visits: number;

  @ViewColumn()
  total_capacitations: number;

  @ViewColumn()
  total_virtual_visits: number;
}
