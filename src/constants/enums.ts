export enum TYPE_OF_PARISHES {
  URBAN = 'Urbano',
  RURAL = 'Rural',
  CANTONAL_CAPITAL = 'Cabecera Cantonal',
}

export enum DEFAULT_STATUS {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo',
}

export enum ASSET_OWNER{
  MINTEL = 'Mintel',
  GAD = 'Gad',
  OTHER = 'Otro'
}

export enum SUPPORT_TYPE {
  SUPPORT_ONE = "Soporte 1",
  SUPPORT_TWO = "Soporte 2"
}

export enum COMMAND_TYPE {
  SUBORDINATE = 'subordinate',
  BOSS = 'boss',
}

export enum TYPE_OF_POINT {
  NORMAL = 'Punto de Encuentro',
  MEGA = 'Megaencuentro',
}

export enum EMPLOYEE_STATUS {
  ACTIVE = 'LINKED',
  UNNACTIVE = 'UNLINKED',
  VULNERABLE = "VULNERABLE"
}

export enum WORKORDER_STATUS {
  DRAFT = 'Borrador',
  CLOSED = 'Cerrada',
}

export enum ASSET_STATUS {
  FUNCTIONAL = 'Funcional',
  NOT_FUNCTIONAL = 'No Funcional',
  FUNCTIONAL_WITH_ISSUES = 'Funcional con deficiencias',
  OPERATIVE = 'Operativo',
  NOT_OPERATIVE = 'No Operativo',
  OPERATIVE_WITH_ISSUES = 'Operativo con deficiencias',
}

export enum VULNERABILITY_STATUS {
  DISABLED = 'Discapacitado',
  GESTATION = 'Gestacion',
  BREASTFEEDING = 'Lactancia',
  PATERNITY = "Paternidad",
  OTHERS = 'OTROS',
  NONE = 'Ninguno',
}
export enum CERTIFICATE_EXCHANGE_STATUS {
  REQUESTED = 'Solicitado',
  APROVED = 'Aprobado',
  REJECTED = 'Rechazado',
}

export enum POINT_STATUS {
  ACTIVE = 'Activo',
  UNNACTIVE = 'Inactivo',
  SUSPENDED = 'Suspendido',
  FUTURE_OPENING = 'Por Abrir'
}

export enum PERMISSION_REQUEST_STATUS {
  DRAFT = 'Borrador',
  REQUESTED = 'Solicitado',
  ACCEPTED = 'Aceptado',
  DECLINED = 'Rechazado',
}

export enum UNIT_OF_TIME {
  HOURS = 'Horas',
  DAYS = 'Dias',
  MONTHS = 'Meses',
}

export enum TYPE_OF_INCIDENT {
  TECHNOLOGICAL = 'Tecnológico',
  FURNITURE = 'Mobiliario',
  CIVILWORK = 'Obra civil',
  CNTSERVICES = 'Servicios CNT',
}

export enum INCIDENT_EMPLOYEE_TYPE {
  MANAGER = 'Gestor',
  TECHNICALASSISTAN = 'Asistente técnico',
}

export enum TICKET_TYPE {
  DISCONNECTION = 'disconnection',
  REGULAR = 'regular',
}

export enum TYPE_OF_ATTENDANCE {
  ENTRANCE_TO_WORK = 'ENTRADA_AL_TRABAJO',
  OUT_TO_EAT = 'SALIDA_A_COMER',
  RETURN_OF_FOOD = 'REGRESO_DE_LA_COMIDA',
  OUT_OF_WORK = 'SALIDA_DEL_TRABAJO',
}

export enum MODULES_NAMES {
  FACETOFACETRAINING = 'faceToFaceTraining',
  WORKORDER = 'workOrder',
  CONECTIVITY = 'conectivity',
  PERMISSION_REQUEST = 'permissionRequest',
  BENEFICIARY = 'beneficiary',
  EMPLOYEE_PERIOD = 'employee-period',
  INCIDENT = 'incident',
  PROGRAM = 'program',
  POINT = 'point',
  CONNECTION_LOGS = 'connection_logs',
}

export enum FILE_ENTITY_NAMES {
  FACETOFACETRAINING = 'training',
  WORKORDER = 'workOrder',
  CONECTIVITY = 'conectivity',
  PERMISSION_REQUEST = 'permissionRequest',
  BENEFICIARY = 'beneficiary',
  EMPLOYEE_PERIOD = 'employee_period',
  INCIDENT = 'incident',
  PROGRAM = 'program',
  POINT = 'point',
  DISCONNECTION_INCIDENT = 'disconnection_incident',
}

/**
 *  planning -> planificacion
    draft -> borrador
    executed -> ejecutado
    not executed -> no ejecutada
    validated -> validado
 */
export enum STATUS_IN_PLANNING {
  PLANNING = 'PLANNING',
  DRAFT = 'DRAFT',
  EJECUTED = 'EJECUTED',
  NO_EXECUTED = 'NO_EXECUTED',
  VALIDATED = 'VALIDATED',
  INVALIDATED = 'INVALIDATED',
}

export enum STATUS_ACTIVITIE_PLANNING {
  VISIT = 'VISIT', //Visita
  TRANSFER = 'TRANSFER', //Traslado
  LUNCH = 'LUNCH', //Almuerzo
  OFFICE_WORK = 'OFFICE_WORK', //Trabajo de oficina
  PERMISSION = 'PERMISSION', //Permiso
}

export enum STATUS_VISIT_PLANNING {
  VIRTUAL = 'VIRTUAL', //Virtual
  FACE_TO_FACE = 'FACE_TO_FACE', //Presencial
}

/**
 * Preventive Maintenance -> mantenimiento preventivo
Corrective maintenance -> mantenimiento correctivo
request from MINTEL -> pedido de MINTEL
community technical support -> soporte tecnico comunitario
community technical maintenance -> mantenimiento tecnico comunitario
holiday -> feriado
permission -> permiso
office -> oficina
transfer ->traslado
lunch -> almuerzo
 */
export enum PLANIFICATIONS_ACTIVITIES {
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  CORRECTIVE_MAINTENANCE = 'CORRECTIVE_MAINTENANCE',
  REQUEST_FROM_MINTEL = 'REQUEST_FROM_MINTEL',
  COMMUNITTY_TECHNICAL_SUPPORT = 'COMMUNITTY_TECHNICAL_SUPPORT',
  COMMUNITTY_TECHNICAL_MAINTENANCE = 'COMMUNITTY_TECHNICAL_MAINTENANCE',
  HOLIDAY = 'HOLIDAY',
  PERMISSION = 'PERMISSION',
  OFFICE = 'OFFICE',
  TRANSFER = 'TRANSFER',
  LUNCH = 'LUNCH',
}
