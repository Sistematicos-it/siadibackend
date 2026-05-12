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
import { SecurityLogsEntity } from '../entities/security.entity';
import { SECURITY_ACTION } from '../interfaces/security.interface';

export class SecurityDTO {
  @ApiProperty({ enum: SECURITY_ACTION })
  @IsNotEmpty()
  @IsEnum(SECURITY_ACTION)
  action: SECURITY_ACTION;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  made_on: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  entry_id?: string;
}

export class SecurityResultDTO {
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
  data: SecurityLogsEntity[];
}
