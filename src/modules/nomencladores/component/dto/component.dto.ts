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
import { ComponentEntity } from '../entities/component.entity';

export class ComponentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class ComponentUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class ComponentResultDTO {
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
  data: ComponentEntity[];
}

export class FindComponentDTO<T extends keyof ComponentDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ComponentDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
