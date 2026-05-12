import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SharingEntity } from '../entities/sharing.entity';

export class SharingDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class SharingUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

}

export class SharingResultDTO {
  
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
  data: SharingEntity[];
}

export class FindSharingDTO<T extends keyof SharingDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(SharingDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
