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
import { ProfessionalTitleEntity } from '../entities/professional-title.entity';

export class ProfessionalTitleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  slug?: string;
  
}

export class ProfessionalTitleUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  slug?: string;
}

export class ProfessionalTitleResultDTO {
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
  data: ProfessionalTitleEntity[];
}

export class FindProfessionalTitleDTO<T extends keyof ProfessionalTitleDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ProfessionalTitleDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
