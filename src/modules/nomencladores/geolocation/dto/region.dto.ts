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
import { RegionEntity } from '../entities/region.entity';

export class RegionDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  country: string;
}

export class RegionsDTO extends Array<RegionDTO> {}

export class RegionUpdateDTO {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  country?: string;
}

export class RegionResultDTO {
  
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
  data: RegionEntity[];
}

export class FindRegionDTO<T extends keyof RegionDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(RegionDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
