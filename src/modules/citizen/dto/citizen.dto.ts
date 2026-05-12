import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
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
import { CitizenEntity } from '../entities/citizen.entity';
import { disability, ethnicity } from '../interfaces/citizen.interface';
import { GENDERS } from 'src/modules/employee/interfaces/employee.interface';

import { CitizenshipEntity } from 'src/modules/nomencladores/person-data/entities/citizenship.entity';

export class CitizenshipAssignationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class CitizenDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_value: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  hasUnderAgeKids?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cell_phone?: string;

  @ApiProperty({ enum: GENDERS })
  @IsNotEmpty()
  @IsEnum(GENDERS)
  gender: GENDERS;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  birth_date: string;

  @ApiProperty({ enum: disability })
  @IsOptional()
  @IsEnum(disability)
  disability?: disability;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  disabilityAmount?: number;

  @ApiProperty({ enum: ethnicity })
  @IsNotEmpty()
  @IsEnum(ethnicity)
  ethnicity: ethnicity;

  @ApiProperty({ type: CitizenshipAssignationDTO })
  @IsNotEmpty()
  @IsObject()
  citizenship: Partial<CitizenshipAssignationDTO>;
}

export class CitizenUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

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
  @IsBoolean()
  isPregnant?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  hasUnderAgeKids?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cell_phone?: string;

  @ApiProperty({ enum: disability })
  @IsOptional()
  @IsEnum(disability)
  disability?: disability;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  disabilityAmount?: number;

  @ApiProperty({ enum: GENDERS })
  @IsOptional()
  @IsEnum(GENDERS)
  gender?: GENDERS;

  @ApiProperty()
  @IsOptional()
  @IsString()
  birth_date?: string;

  @ApiProperty({ enum: ethnicity })
  @IsOptional()
  @IsEnum(ethnicity)
  ethnicity?: ethnicity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  citizenship?: Partial<CitizenshipEntity>;
}

export class CitizenResultDTO {
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
  data: CitizenEntity[];
}

export class FindCitizenDTO<T extends keyof CitizenDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CitizenDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
