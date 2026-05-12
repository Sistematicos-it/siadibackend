import { POINT_STATUS } from 'src/constants/enums';

export interface IPoint {
  code: string;
  name: string;
}

export interface IProvinceData {
  province_name: string;
  pde_per_canton: IProvinceCantonCount[];
  province_general_data: IVisitData;
  total_pde: number;
  pde_per_status: IProvincePdeCountPerStatus[];
  canton_data?: Partial<ICantonData>;
  courses_list?: ICourseGeolocation[];
}

export interface ICantonData {
  canton_name: string;
  pde_per_parish: IParishPDECount[];
  canton_general_data: IVisitData;
  pde_per_status: IProvincePdeCountPerStatus[];
  parish_visits_data: IParishVisitCountPerType;
  total_pde_per_parish: number;
}

export interface IProvinceCantonCount {
  canton_name: string;
  count: number;
}

export interface IVisitData {
  population_visit: number;
  visit_number: number;
  trained: number;
  parish_number: number;
  canton_number: number;
}

export interface IProvincePdeCountPerStatus {
  status: POINT_STATUS;
  parish_pdes: IParishPDECount[];
  total: number;
}

export interface IParishPDECount {
  parish_name: string;
  pde_count: number;
}

export interface ICantonParishVisitCount {
  parish_name: string;
  count: string;
}

export interface IParishVisitCountPerType {
  visits: ICantonParishVisitCount[];
  total_visits: number;
  trained: ICantonParishVisitCount[];
  total_trained: number;
}

export interface ICourseGeolocation {
  name: string;
  start_date: string;
  end_date: string;
}







