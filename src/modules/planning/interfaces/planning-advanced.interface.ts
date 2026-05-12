import { PlanningAdvancedEntity } from "../entities/planning-advanced.entity";

export interface IPlanningAdvanced {
  activity: string;
  start_date?: string;
  estimated_time: string
}

export interface IPlanningAdvancedReport {
  start_date: string;
  plannings: PlanningAdvancedEntity[]
}
