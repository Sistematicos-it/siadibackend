import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CitizenshipEntity } from '../entities/citizenship.entity';

export class CitizenshipDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class CitizenshipUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

}

export class CitizenshipResultDTO {
  
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
  data: CitizenshipEntity[];
}

export class FindCitizenshipDTO<T extends keyof CitizenshipDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CitizenshipDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
