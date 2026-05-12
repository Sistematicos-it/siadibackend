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
import { SpecializationEntity } from '../entities/specialization.entity';

export class SpecializationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class SpecializationUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class SpecializationResultDTO {
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
  data: SpecializationEntity[];
}

export class FindSpecializationDTO<T extends keyof SpecializationDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(SpecializationDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
