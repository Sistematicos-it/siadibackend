import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IncidentIssuesEntity } from '../entities/incident-issues.entity';
import { INCIDENT_EMPLOYEE_TYPE, TYPE_OF_INCIDENT } from 'src/constants/enums';

export class IncidentIssuesDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: TYPE_OF_INCIDENT })
  @IsNotEmpty()
  @IsEnum(TYPE_OF_INCIDENT)
  incidentType: TYPE_OF_INCIDENT;

  @ApiProperty({ enum: INCIDENT_EMPLOYEE_TYPE })
  @IsNotEmpty()
  @IsEnum(INCIDENT_EMPLOYEE_TYPE)
  employeeType: INCIDENT_EMPLOYEE_TYPE;
}

export class IncidentIssuesUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_INCIDENT)
  incidentType?: TYPE_OF_INCIDENT;

  @ApiProperty({ enum: INCIDENT_EMPLOYEE_TYPE })
  @IsOptional()
  @IsEnum(INCIDENT_EMPLOYEE_TYPE)
  employeeType?: INCIDENT_EMPLOYEE_TYPE;
}

export class IncidentIssuesResultDTO {
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
  data: IncidentIssuesEntity[];
}

export class FindIncidentIssuesDTO<T extends keyof IncidentIssuesDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(IncidentIssuesDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
