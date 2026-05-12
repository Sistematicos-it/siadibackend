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
import { EquipmentEntity } from '../entities/equipment.entity';

export class EquipmentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class EquipmentUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class EquipmentResultDTO {
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
  data: EquipmentEntity[];
}

export class FindEquipmentDTO<T extends keyof EquipmentDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(EquipmentDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
