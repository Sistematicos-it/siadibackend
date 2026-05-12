import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SpeedEntity } from '../entities/speed.entity';

export class SpeedDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  download: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  upFile: number;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class SpeedUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  download?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  upFile?: number;

}

export class SpeedResultDTO {
  
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
  data: SpeedEntity[];
}

export class FindSpeedDTO<T extends keyof SpeedDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(SpeedDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
