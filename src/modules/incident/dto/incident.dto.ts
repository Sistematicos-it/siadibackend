import { ApiProperty } from '@nestjs/swagger';
import {
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
import { IncidentEntity } from '../entities/incident.entity';
import { IncidentIssuesEntity } from 'src/modules/nomencladores/incident-issues/entities/incident-issues.entity';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { IncidentAssetsEntity } from '../entities/incident-assets.entity';
import { IncidentLogsEntity } from '../entities/incident-logs.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { SUPPORT_TYPE } from 'src/constants/enums';

export class IncidentLogsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  details: string;

}

export class GetIncidentResultDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  incident_number: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_ticket?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsNotEmpty()
  solved_date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  closed_date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  requester: EmployeeEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  assigned_to: EmployeeEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  issue: IncidentIssuesEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  files: FileEntity[];

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  logs: IncidentLogsEntity[];

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  assets: IncidentAssetsEntity[];
}

export class UpdateIncidentLogsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  details?: string;
}

export class IncidentAssetsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  incident: IncidentEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  asset: AssetEntity;
}

export class IncidentDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_ticket?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  assets?: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  issue: IncidentIssuesEntity;
}

export class DisconnectionIncidentDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  point?: string;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  files: FileEntity[];
}

export class DisconnectionIncidentUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  point?: string;
}

export class IncidentUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_ticket?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  issue?: IncidentIssuesEntity;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  assets?: any;
}

export class IncidentReportDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty()
  @IsOptional()
  point?: PointEntity;

  @ApiProperty()
  @IsOptional()
  @IsString()
  incident_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  incident_number?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_ticket?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  incidentType?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  incidentName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  register_date?: string;

  @ApiProperty()
  @IsOptional()
  solved_date?: Date;

  @ApiProperty()
  @IsOptional()
  closed_date?: Date;

  details: string;

  issue: Partial<IncidentIssuesEntity>;

  responsible: EmployeeEntity;

  requester: EmployeeEntity;

  logs: Array<IncidentLogsEntity>
}

export class ReportGetIncidentDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  idIncident: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  supportType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  deliveryCertificateNumber: string;
}

export class IncidentResultDTO {
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
  data: IncidentEntity[];
}

export class FindIncidentDTO<T extends keyof IncidentDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(IncidentDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
