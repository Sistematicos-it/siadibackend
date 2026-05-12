import { PlanningAdvancedEntity } from '../entities/planning-advanced.entity';
import { PlanningEntity } from '../entities/planning.entity';

export interface IPlanning {
  activity: string;
  start_date?: string;
  estimated_time: string;
}

export interface IPlanningReport {
  start_date: string;
  plannings: PlanningEntity[]
}
