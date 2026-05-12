import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { Optional } from '@nestjs/common';
import { ReportConnectionLogsEntity } from '../entities/report-connection-logs.entity';

export class ReportConnectionLogsDTO {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  province_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  canton_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  parish_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_pde: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  connectivity: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tman: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tmov: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tfault: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tpen: number;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  ti: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  fcs: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  d: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tm: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tt: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  monthlyFee_pde: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  valueToPay: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discountOfUnavailability: number;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  subTotalMonthlyFee_pde: number;
}

export class ReportConnectionLogsUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  code_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  province_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  canton_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  parish_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description_pde?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  connectivity?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tman?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tmov?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tfault?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tpen?: number;
  
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ti?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  d: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  fcs?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tm?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  tt?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  monthlyFee_pde?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  valueToPay?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  discountOfUnavailability?: number;
  
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  subTotalMonthlyFee_pde?: number;
}

export class ReportConnectionLogsResultDTO {
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
  data: ReportConnectionLogsEntity[];
}

export class FindConnectionLogsDTO<T extends keyof ReportConnectionLogsDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ReportConnectionLogsDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
