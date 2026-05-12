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
import { VisitTypeEntity } from '../entities/visit-type.entity';
import {
  GENDERS,
  MARITAL_STATUS,
} from 'src/modules/employee/interfaces/employee.interface';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { InstitutionEntity } from 'src/modules/nomencladores/institution/entities/institution.entity';
import { PoliticalLineEntity } from 'src/modules/nomencladores/political-line/entities/political-line.entity';

export class VisitTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  value: string;

}


export class VisitTypeResultDTO {
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
  data: VisitTypeEntity[];
}

export class FindVisitTypeDTO<T extends keyof VisitTypeDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(VisitTypeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
