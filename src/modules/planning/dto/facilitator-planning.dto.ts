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
import { FacilitatorPlanningEntity } from '../entities/facilitator-planning.entity';
import { STATUS_IN_PLANNING } from 'src/constants/enums';

export class FacilitatorPlanningDTO {
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
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;
}

export class FacilitatorPlanningUpdateDTO {
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
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(STATUS_IN_PLANNING)
  status?: STATUS_IN_PLANNING;
}

export class FacilitatorPlanningResultDTO {
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
  data: FacilitatorPlanningEntity[];
}

export class FindFacilitatorPlanningDTO<
  T extends keyof FacilitatorPlanningDTO,
> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(FacilitatorPlanningDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
