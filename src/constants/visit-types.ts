import { IVisitType } from 'src/modules/visit-type/interfaces/visit-type.interface';

export enum VISIT_TYPES {
  FACE_TO_FACE = 'FACE_TO_FACE',
  ON_SITE = 'ON_SITE',
  VIRTUAL = 'VIRTUAL',
  VISIT = 'VISIT',
}

export const VisitTypes: IVisitType[] = [
  {
    name: 'Presencial',
    value: 'FACE_TO_FACE',
  },
  {
    name: 'En sitio',
    value: 'ON_SITE',
  },
  {
    name: 'Virtual',
    value: 'VIRTUAL',
  },
  {
    name: 'De visita',
    value: 'VISIT',
  },
];
