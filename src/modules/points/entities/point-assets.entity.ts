import { ASSET_CATEGORY } from 'src/modules/nomencladores/asset-type/interfaces/asset-type.interface';
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: ` SELECT
  asset."id" AS asset_id, 
  asset.description AS asset_description, 
  asset.code AS asset_code, 
  asset.observation AS asset_observation, 
  employee."id" AS employee_id, 
  point."id" AS point_id, 
  employee."name" AS employee_name, 
  employee.id_value AS employee_nui, 
  employee.user_type AS employee_role, 
  asset_type.category, 
  point."name" AS point_name
FROM
  asset
  LEFT JOIN
  employee
  ON 
	  asset.responsible_employee_id = employee."id"
  LEFT JOIN
  point
  ON 
	  employee."id" = point.facilitator_employee_id
  LEFT JOIN
  asset_type
  ON 
	  asset.type_id = asset_type."id"
    
    WHERE point.deleted_at IS NULL`,
		name: 'point_assets_entity'
})
export class PointAssetsEntity {
  @ViewColumn()
  asset_id: string;

  @ViewColumn()
  asset_description: string;

  @ViewColumn()
  asset_code: string;

  @ViewColumn()
  asset_observation: string;

  @ViewColumn()
  employee_id: string;

  @ViewColumn()
  employee_name: string;

  @ViewColumn()
  employee_nui: string;

  @ViewColumn()
  employee_role: string;

  @ViewColumn()
  point_id: string;

  @ViewColumn()
  category: ASSET_CATEGORY

  @ViewColumn()
  point_name: string
}
