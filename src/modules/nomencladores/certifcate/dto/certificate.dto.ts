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
import { CertificateEntity } from '../entities/certificate.entity';

export class CertificateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false, type: "file"})
  @IsOptional()
  file?: string;
}

export class CertificateUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, type: "file"})
  @IsOptional()
  file?: string;
}

export class CertificateResultDTO {
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
  data: CertificateEntity[];
}

export class FindCertificateDTO<T extends keyof CertificateDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CertificateDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
