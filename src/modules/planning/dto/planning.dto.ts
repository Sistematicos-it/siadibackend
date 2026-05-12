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
import { PlanningEntity } from '../entities/planning.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { AssignPointDTO } from 'src/modules/points/dto/point.dto';
import { AssignProgramDTO } from 'src/modules/nomencladores/program/dto/program.dto';
import {
  PLANIFICATIONS_ACTIVITIES,
  STATUS_IN_PLANNING,
} from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { Type } from 'class-transformer';

export class AssignPlanningDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class AssignEquipmentDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string
}

export class AssignComponentDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string
}

export class AssignIncidentDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string
}

export class AssignEquipementsDTO extends Array<AssignEquipmentDTO>{}

export class AssignIncidentsDTO extends Array<AssignIncidentDTO>{}

export class AssignComponentsDTO extends Array<AssignComponentDTO>{}

export class ValidatePlanningDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  id: Array<string>;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_IN_PLANNING)
  status: STATUS_IN_PLANNING;
}


export class SubordinatePlanningDTO {
  @ApiProperty()
  @IsNotEmpty()
  employee: EmployeeEntity;

  @ApiProperty()
  @IsNotEmpty()
  plannings: PlanningEntity[];
}
export class PlanningDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PLANIFICATIONS_ACTIVITIES)
  activity: PLANIFICATIONS_ACTIVITIES;

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
  @IsBoolean()
  applyPerDiem?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsUUID()
  // userId: string;

  // @IsOptional()
  // @IsUUID()
  // employee?: string;

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
  @IsUUID()
  reports?: string;

  @ApiProperty()
  @IsOptional()
  @Type(()=> AssignEquipmentDTO)
  equipments?: AssignEquipementsDTO;

  @ApiProperty()
  @IsOptional()
  @Type(()=> AssignComponentDTO)
  components?: AssignComponentsDTO;

  @ApiProperty()
  @IsOptional()
  @Type(()=> AssignIncidentDTO)
  incidents?: AssignIncidentsDTO;
}





export class PlanningUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(PLANIFICATIONS_ACTIVITIES)
  activity?: PLANIFICATIONS_ACTIVITIES;

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
  @IsBoolean()
  applyPerDiem?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsUUID()
  // userId?: string;

  // @IsOptional()
  // @IsUUID()
  // employee?: string;

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
  @IsUUID()
  reports?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { each: true })
  equipments?: string[];

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { each: true })
  components?: string[];

  @ApiProperty()
  @IsOptional()
  @IsUUID('all', { each: true })
  incidents?: string[];
}

export class PlanningResultDTO {
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
  data: PlanningEntity[];
}

export class FindPlanningDTO<T extends keyof PlanningDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PlanningDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
