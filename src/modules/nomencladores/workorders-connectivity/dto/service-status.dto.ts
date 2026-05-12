import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ServiceStatusEntity } from '../entities/service-status.entity';

export class ServiceStatusDTO {  
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  slug?: string;
}

export class ServiceStatusUpdateDTO {  
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

}

export class ServiceStatusResultDTO {
  
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
  data: ServiceStatusEntity[];
}

export class FindServiceStatusDTO<T extends keyof ServiceStatusDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ServiceStatusDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
