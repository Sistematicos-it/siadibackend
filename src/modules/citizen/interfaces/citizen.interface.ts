import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';

export interface ICitizen {
  id_value?: string;
  name: string;
  email?: string;
  phone?: string;
  cell_phone?: string;
  gender: GENDERS;
  birth_date?: string;
  disability?: disability;
  disabilityAmount?: number;
  ethnicity: ethnicity;
}

export enum ethnicity {
  afro_ecuadorian = 'Afro-Ecuatoriano',
  half_blood = 'Mestizo',
  native = 'Indigena',
  white = 'Blanco',
}

export enum disability {
  none = "Ninguno",
  hearing = "Auditiva",
  mental = "Mental",
  phisical = "Fisica"
}
