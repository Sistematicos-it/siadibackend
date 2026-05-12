export enum GENDERS {
  MALE = 'M',
  FEMALE = 'F',
}

export enum MARITAL_STATUS {
  SINGLE = 'SOLTERO',
  MARIED = 'CASADO',
  WIDOWED = 'VIUDO',
  DIVORCED = 'DIVORCIADO',
  FREE_UNION = 'UNION LIBRE',
  COMMON_LAW = 'UNION DE HECHO',
}

export interface IPeriods{
  start_date: string
  end_date?: string
}

export interface IFiles{
  file: string
}

export interface IEmployee {
  name: string;
  id_value: string;
  position: string;
  code?: string;
  address: string;
  email: string;
  phone?: string;
  facebook_profile?: string;
  salary?: number;
  gender?: GENDERS;
  marital_status?: MARITAL_STATUS;
}


