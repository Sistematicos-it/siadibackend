import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TechnologyEntity } from '../entities/technology.entity';

export class TechnologyDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class TechnologyUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

}

export class TechnologyResultDTO {
  
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
  data: TechnologyEntity[];
}

export class FindTechnologyDTO<T extends keyof TechnologyDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(TechnologyDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
