import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PERMISSION_REQUEST_STATUS, UNIT_OF_TIME } from 'src/constants/enums';
import { PermissionRequestEntity } from '../entities/permission-request.entity';


export class ValidatePermissionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PERMISSION_REQUEST_STATUS)
  status: PERMISSION_REQUEST_STATUS
}
export class PermissionRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  permissionType: string;

  @ApiProperty()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  time: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UNIT_OF_TIME)
  unitTime: UNIT_OF_TIME;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsEnum(PERMISSION_REQUEST_STATUS)
  status?: PERMISSION_REQUEST_STATUS;
}

export class PermissionRequestUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  permissionType?: string;

  @ApiProperty()
  @IsNotEmpty()
  start_date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  end_date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  time?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UNIT_OF_TIME)
  unitTime?: UNIT_OF_TIME;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsEnum(PERMISSION_REQUEST_STATUS)
  status?: PERMISSION_REQUEST_STATUS;
}

export class PermissionRequestResultDTO {
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
  data: PermissionRequestEntity[];
}

export class FindPermissionRequestDTO<T extends keyof PermissionRequestDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PermissionRequestDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
