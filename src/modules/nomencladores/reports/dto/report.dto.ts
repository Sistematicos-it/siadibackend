import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReportEntity } from '../entities/report.entity';

export class ReportDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class ReportUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class ReportResultDTO {
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
  data: ReportEntity[];
}

export class FindReportDTO<T extends keyof ReportDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ReportDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
