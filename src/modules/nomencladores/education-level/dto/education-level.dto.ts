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
import { EducationLevelEntity } from '../entities/education-level.entity';


export class AssignEducationLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class EducationLevelDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class EducationLevelUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class EducationLevelResultDTO {
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
  data: EducationLevelEntity[];
}

export class FindEducationLevelDTO<T extends keyof EducationLevelDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(EducationLevelDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
