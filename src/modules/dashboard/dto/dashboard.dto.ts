import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
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
import {
  PLANIFICATIONS_ACTIVITIES,
  STATUS_IN_PLANNING,
} from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';

export class AssignDashboardDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class InfoCardDashboardDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalViews: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalTrainings: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalVirtualTrainings: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalVisitors: number
}

export class ResultInfoCardDashboardDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  data: InfoCardDashboardDTO
}

export class DashboardDTO {
  @ApiProperty()
  @IsOptional()
  value?: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  denominacion?: string

  @ApiProperty()
  @IsOptional()
  @IsArray()
  data?: number[]
}

export class ResultDashboardDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  data: DashboardDTO[]
}


export class ResultWithLabelDashboardDTO {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  label: string[]

  @ApiProperty({ type: [DashboardDTO] })
  @IsArray()
  @IsNotEmpty()
  series: DashboardDTO[]
}


export class FilterCardsDashboardDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  pde?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  parish?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  canton?: string


  @ApiProperty()
  @IsOptional()
  @IsUUID()
  province?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  region?: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  year?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  month?: number
}

export class FiltersDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  category?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  pde?: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  year?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  month?: number

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  canton?: string;

  @IsOptional()
  @IsString()
  parish?: string;
}


