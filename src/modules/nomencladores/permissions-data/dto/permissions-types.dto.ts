import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PermissionTypeEntity } from '../entities/permissions-types.entity';
import { UNIT_OF_TIME } from 'src/constants/enums';

export class PermissionTypeDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  maxiTimeAllowed: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UNIT_OF_TIME)
  unitTime: UNIT_OF_TIME;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class PermissionTypeUpdateDTO {  
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
  maxiTimeAllowed?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UNIT_OF_TIME)
  unitTime?: UNIT_OF_TIME;
}

export class PermissionTypeResultDTO {
  
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
  data: PermissionTypeEntity[];
}

export class FindPermissionTypeDTO<T extends keyof PermissionTypeDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PermissionTypeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
