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
import { PoliticalLineEntity } from '../entities/political-line.entity';

export class PoliticalLineDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class PoliticalLineUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class PoliticalLineResultDTO {
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
  data: PoliticalLineEntity[];
}

export class FindPoliticalLineDTO<T extends keyof PoliticalLineDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PoliticalLineDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
