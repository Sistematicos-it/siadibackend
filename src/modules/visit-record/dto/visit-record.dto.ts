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
import { VisitRecordEntity } from '../entities/visit-record.entity';

import { PointEntity } from 'src/modules/points/entities/point.entity';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { IVisitCount } from 'src/modules/visit-type/interfaces/visit-type.interface';
import { ITotalVisits } from '../interfaces/visit-record.interface';

export class VisitCountDTO {
  @ApiProperty()
  @IsNotEmpty()
  point: PointEntity;

  @ApiProperty()
  @IsNotEmpty()
  count: IVisitCount[];
}

export class VisitTotalDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  point_ids: string[];
}

export class ITotalVisitArrayDTO extends Array<ITotalVisitDTO>{}
export class ITotalVisitDTO implements ITotalVisits {
  point_name: string;
  point_id: string;
  age_baby: number;
  age_small_kid: number;
  age_preescholar_kid: number;
  age_primary_kid: number;
  age_adolescent: number;
  age_young_adult: number;
  age_early_adulthood: number;
  age_middle_adult: number;
  age_mayor_adult: number;
  entnicithy_afroecuadorian: number;
  entnicithy_halfbreed: number;
  entnicithy_native: number;
  entnicithy_white: number;
  isPregnant: number;
  hasLittleChildren: number;
  total_under_age: number;
  total_adults: number;
  total_man: number;
  total_woman: number;
  total: number;
}


export class VisitRecordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  point: PointEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  citizen: CitizenEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(VISIT_TYPES)
  visit_type: VISIT_TYPES;
}

export class VisitRecordResultDTO {
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
  data: VisitRecordEntity[];
}

export class FindVisitRecordDTO<T extends keyof VisitRecordDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(VisitRecordDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}

export interface iPDG {
  point: string;        
  facetoface: number;
  visit: number;
  virtual: number;
  on_site: number;
  total: number;
}
export interface iCanton {
  canton: string;
  points: Map<string, iPDG>;
  facetoface: number;
  visit: number;
  virtual: number;
  on_site: number;
  total: number;
}
export interface iProvince {        
  province: string;        
  cantons: Map<string, iCanton>;
  facetoface: number;
  visit: number;
  virtual: number;
  on_site: number;
  total: number;
}
export interface iRegion {        
  region: string;
  provinces: Map<string, iProvince>;
  facetoface: number;
  visit: number;
  virtual: number;
  on_site: number;
  total: number;
}