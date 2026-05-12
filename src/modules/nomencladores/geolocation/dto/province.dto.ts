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
import { ProvinceEntity } from '../entities/province.entity';

export class ProvinceDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  region: string;
}


export class ProvinceUpdateDTO {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  region?: string;
}

export class ProvinceResultDTO {
  
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
  data: ProvinceEntity[];
}

export class FindProvinceDTO<T extends keyof ProvinceDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ProvinceDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
