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
import { BeneficiaryEntity } from '../entities/beneficiary.entity';
import { government_affinity } from '../interfaces/beneficiary.interface';
import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';
import { BeneficiaryTypeEntity } from 'src/modules/nomencladores/beneficiary-type/entities/beneficiary-type.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { InstitutionEntity } from 'src/modules/nomencladores/institution/entities/institution.entity';
import { PoliticalLineEntity } from 'src/modules/nomencladores/political-line/entities/political-line.entity';

export class BeneficiaryDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  id_value?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  alt_phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cell_phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facebook_link?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  web_link?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(government_affinity)
  government_affinity?: government_affinity;

  @ApiProperty()
  @IsOptional()
  @IsEnum(GENDERS)
  gender?: GENDERS;

  @ApiProperty()
  @IsOptional()
  @IsEnum(MARITAL_STATUS)
  marital_status?: MARITAL_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birth_date?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  type: Partial<BeneficiaryTypeEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  address?: Partial<AddressEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  title?: Partial<ProfessionalTitleEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  institution?: Partial<InstitutionEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  political_line?: Partial<PoliticalLineEntity>
}

export class BeneficiaryUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  id_value?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  alt_phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cell_phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facebook_link?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  web_link?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(government_affinity)
  government_affinity?: government_affinity;

  @ApiProperty()
  @IsOptional()
  @IsEnum(GENDERS)
  gender?: GENDERS;

  @ApiProperty()
  @IsOptional()
  @IsEnum(MARITAL_STATUS)
  marital_status?: MARITAL_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birth_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  type: Partial<BeneficiaryTypeEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  address?: Partial<AddressEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  title?: Partial<ProfessionalTitleEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  institution?: Partial<InstitutionEntity>

  @ApiProperty()
  @IsOptional()
  @IsObject()
  political_line?: Partial<PoliticalLineEntity>

}

export class BeneficiaryResultDTO {
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
  data: BeneficiaryEntity[];
}

export class FindBeneficiaryDTO<T extends keyof BeneficiaryDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(BeneficiaryDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
