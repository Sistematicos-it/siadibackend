import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';

export interface IBeneficiary {
  id_value?: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  alt_phone?: string;
  cell_phone?: string;
  facebook_link?: string;
  web_link?: string;
  government_affinity?: government_affinity;
  gender?: GENDERS;
  marital_status?: MARITAL_STATUS;
  birth_date?: string;
}

export enum government_affinity {
  affinity = 'Afinidad',
  neutral = 'Neutral',
  against = 'En Contra',
}
