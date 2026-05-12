import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ActivitieEntity } from '../entities/activitie.entity';

export class ActivitieDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class ActivitieUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

}

export class ActivitieResultDTO {
  
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
  data: ActivitieEntity[];
}

export class FindActivitieDTO<T extends keyof ActivitieDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ActivitieDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
