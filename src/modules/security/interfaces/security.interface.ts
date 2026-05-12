export enum SECURITY_ACTION {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  CITIZEN_LOGIN = 'CITIZEN_LOGIN',
  EMPLOYEE_LOGIN = 'EMPLOYEE_LOGIN'
}

export interface ISecurity {
  action: SECURITY_ACTION;
  made_on: Date;
  entity?: string;
  entry_id?: string;
}
