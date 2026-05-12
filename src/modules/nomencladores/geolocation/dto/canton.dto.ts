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
import { CantonEntity } from '../entities/canton.entity';

export class CantonDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  province: string;
}


export class CantonUpdateDTO {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  province?: string;
}

export class CantonResultDTO {
  
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
  data: CantonEntity[];
}

export class FindCantonDTO<T extends keyof CantonDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CantonDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
