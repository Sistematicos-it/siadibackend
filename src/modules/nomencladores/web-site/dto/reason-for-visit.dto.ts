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
import { ReasonForVisitEntity } from '../entities/reason-for-visit.entity';

export class ReasonForVisitDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class ReasonForVisitUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description?: string;
}

export class ReasonForVisitResultDTO {
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
  data: ReasonForVisitEntity[];
}

export class FindReasonForVisitDTO<T extends keyof ReasonForVisitDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ReasonForVisitDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
