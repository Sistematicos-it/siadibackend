import { IRoles } from "src/modules/roles/interfaces/role.interface";

export enum ROLES {
  ADMIN = 'ADMIN',
  CITIZEN = "CITIZEN",
  FACILITATOR = "FACILITATOR",
  MANAGER = "MANAGER",
  HUMAN_TALENT = "HUMAN_TALENT",
  COORDINATOR = "COORDINATOR",
  TECHNICAL_ASSISTENT = "TECHNICAL_ASSISTENT",
  TECHNICAL_CHIEF = "TECHNICAL_CHIEF",
  MONITOR = "MONITOR",
  UNASSIGNED = "UNASSIGNED"

}

export enum ACCESS_LEVEL {
  DEVELOPER = 30,
  MANTEINER = 40,
  OWNER = 50,
}

export const ROLE_VALUES: IRoles[] = [
  {
    role_name: "Administrador",
    role_value: "ADMIN"
  },
  {
    role_name: "Ciudadano",
    role_value: "CITIZEN"
  },
  {
    role_name: "Facilitador",
    role_value: "FACILITATOR"
  },
  {
    role_name: "Gestor",
    role_value: "MANAGER"
  },
  {
    role_name: "Talento Humano",
    role_value: "HUMAN_TALENT"
  },
  {
    role_name: "Coordinador",
    role_value: "COORDINATOR"
  },
  {
    role_name: "Asistente Tecnico",
    role_value: "TECHNICAL_ASSISTENT"
  },
  {
    role_name: "Jefe Tecnico",
    role_value: "TECHNICAL_CHIEF"
  },
  {
    role_name: "Monitor",
    role_value: "MONITOR"
  },
  {
    role_name: "No asignado",
    role_value: "UNASSIGNED"
  }
]