import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileCategoryEntity } from '../entities/file-category.entity';

export class FileCategoryDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class FileCategoryUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class FileCategoryResultDTO {
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
  data: FileCategoryEntity[];
}

export class FindFileCategoryDTO<T extends keyof FileCategoryDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(FileCategoryDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
