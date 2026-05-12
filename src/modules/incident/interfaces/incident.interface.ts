export interface IIncident {
  incident_number: number;
  cnt_ticket?: string;
  observation?: string;
  solved_date?: Date;
  closed_date?: Date;
}

export interface IIncidentLogs {
  details: string;
}
