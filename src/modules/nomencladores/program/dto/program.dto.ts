import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ProgramEntity } from '../entities/program.entity';
import { CertificateEntity } from '../../certifcate/entities/certificate.entity';


export class AssignProgramDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
export class ProgramDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  hours: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  min_age?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  max_age?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  certificate: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsObject()
  // certificate: Partial<CertificateEntity>;
}

export class ProgramUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  hours?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  min_age?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  max_age?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  certificate: string;

  // @ApiProperty()
  // @IsOptional()
  // @IsObject()
  // certificate?: Partial<CertificateEntity>;
}

export class ProgramResultDTO {
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
  data: ProgramEntity[];
}

export class FindProgramDTO<T extends keyof ProgramDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ProgramDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
