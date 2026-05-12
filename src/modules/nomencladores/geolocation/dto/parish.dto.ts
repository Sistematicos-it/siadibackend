import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TYPE_OF_PARISHES } from 'src/constants/enums';
import { ParishEntity } from '../entities/parish.entity';

export class ParishDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  canton: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TYPE_OF_PARISHES)
  type: TYPE_OF_PARISHES;
}


export class ParishUpdateDTO {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  canton?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_PARISHES)
  type?: TYPE_OF_PARISHES;
}

export class ParishResultDTO {
  
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
  data: ParishEntity[];
}

export class FindParishDTO<T extends keyof ParishDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ParishDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
