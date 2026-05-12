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
import { CourseCatalogEntity } from '../entities/course-catalog.entity';

export class CourseCatalogDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CourseCatalogSwaggerDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: any;
}

export class CourseCatalogUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;
}

export class CourseCatalogResultDTO {
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
  data: CourseCatalogEntity[];
}

export class FindCourseCatalogDTO<T extends keyof CourseCatalogDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CourseCatalogDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
