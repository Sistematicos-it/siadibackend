import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PlanningAdvancedEntity } from '../entities/planning-advanced.entity';

import {
  STATUS_ACTIVITIE_PLANNING,
  STATUS_IN_PLANNING,
  STATUS_VISIT_PLANNING,
} from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { Type } from 'class-transformer';

export class SubordinatePlanningAdvancedDTO {
  @ApiProperty()
  @IsNotEmpty()
  employee: EmployeeEntity;

  @ApiProperty()
  @IsNotEmpty()
  plannings: PlanningAdvancedEntity[];
}

export class AssignPlanningAdvancedDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class AssignIncidentDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string;
}

export class AssignIncidentsDTO extends Array<AssignIncidentDTO> {}
export class PlanningAdvancedDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_ACTIVITIE_PLANNING)
  activity: STATUS_ACTIVITIE_PLANNING;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  start_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  estimated_time: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_VISIT_PLANNING)
  visitActivityType?: STATUS_VISIT_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  visitPoint?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  sourceAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  destinationAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  visitReasonOfVisit?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  applyPerDiem?: boolean;

  @ApiProperty()
  @IsOptional()
  @Type(()=> AssignIncidentDTO)
  incidents?: AssignIncidentsDTO;
}

export class PlanningAdvancedUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_ACTIVITIE_PLANNING)
  activity?: STATUS_ACTIVITIE_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  estimated_time?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_VISIT_PLANNING)
  visitActivityType?: STATUS_VISIT_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  visitPoint?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  sourceAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  destinationAddress?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  visitReasonOfVisit?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  applyPerDiem?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { each: true })
  incidents?: string[];
}

export class PlanningAdvancedResultDTO {
  @IsNotEmpty()
  @IsNumber()
  pageNumber: number;

  @IsNotEmpty()
  @IsNumber()
  pageLimit: number;

  @IsNotEmpty()
  @IsNumber()
  totalElements: number;

  @IsNotEmpty()
  @IsNumber()
  totalPages: number;

  @IsNotEmpty()
  @IsArray()
  data: PlanningAdvancedEntity[];
}

export class FindPlanningAdvancedDTO<T extends keyof PlanningAdvancedDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PlanningAdvancedDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
