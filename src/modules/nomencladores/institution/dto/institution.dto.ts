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
import { InstitutionEntity } from '../entities/institution.entity';

export class InstitutionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class InstitutionUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class InstitutionResultDTO {
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
  data: InstitutionEntity[];
}

export class FindInstitutionDTO<T extends keyof InstitutionDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(InstitutionDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
