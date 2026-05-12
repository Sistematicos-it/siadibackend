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
import { PointStatusEntity } from '../entities/point-status.entity';

export class PointStatusDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class PointStatusUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class PointStatusResultDTO {
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
  data: PointStatusEntity[];
}

export class FindPointStatusDTO<T extends keyof PointStatusDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PointStatusDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
