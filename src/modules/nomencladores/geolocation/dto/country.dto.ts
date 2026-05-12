import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RegionDTO, RegionsDTO } from './region.dto';
import { CountryEntity } from '../entities/country.entity';
import { Type } from 'class-transformer';

export class CountryDTO {  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @Type(()=>RegionDTO)
  regions: RegionsDTO;
}

export class CountryUpdateDTO {  
  @ApiProperty()
  @IsOptional()
  @IsString()
  code: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @Type(()=>RegionDTO)
  regions: RegionsDTO;
}

export class CountryResultDTO {
  
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
  data: CountryEntity[];
}

export class FindCountryDTO<T extends keyof CountryDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CountryDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
