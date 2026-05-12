import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ConnectionLogsEntity } from '../entities/connection-logs.entity';
import { FileEntity } from 'src/modules/file/entities/file.entity';
import { Optional } from '@nestjs/common';

export class ConnectionLogsDTO {

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sent: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  received: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lost: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  loss_percentage: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  host: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  timestamp: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  files: FileEntity[];
}

export class ConnectionLogsUpdateDTO {

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  sent?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  received?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  lost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  loss_percentage?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  timestamp?: Date;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  files?: FileEntity[];
}

export class ConnectionLogsResultDTO {
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
  data: ConnectionLogsEntity[];
}

export class FindConnectionLogsDTO<T extends keyof ConnectionLogsDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ConnectionLogsDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
