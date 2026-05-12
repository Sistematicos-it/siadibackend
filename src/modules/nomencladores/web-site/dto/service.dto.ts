import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ServiceEntity } from '../entities/service.entity';

export class ServiceDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  categorie: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  coverImage?: string
}

export class ServiceSwaggerDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  image?: any;
}

export class ServiceUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  coverImage?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  categorie?: string;
}

export class ServiceResultDTO {
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
  data: ServiceEntity[];
}

export class FindServiceDTO<T extends keyof ServiceDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ServiceDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
