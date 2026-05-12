import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInstance,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CertificateExchangeEntity } from '../entities/certificate-exchange.entity';

import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { CERTIFICATE_EXCHANGE_STATUS } from 'src/constants/enums';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';

export class ValidateCertificateDTO{
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(CERTIFICATE_EXCHANGE_STATUS)
  status: CERTIFICATE_EXCHANGE_STATUS;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observation?: string
}

export class CertificateExchangeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  certificate_code: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  course?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  citizen: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  program?: string;
}

export class UpdateCertificateExchangeDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  certificate_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(CERTIFICATE_EXCHANGE_STATUS)
  status?: CERTIFICATE_EXCHANGE_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  course?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  citizen: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  program?: string;
}

export class CertificateExchangeResultDTO {
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
  data: CertificateExchangeEntity[];
}

export class FindCertificateExchangeDTO<
  T extends keyof CertificateExchangeDTO,
> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CertificateExchangeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
