import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIP,
  IsIn,
  IsInstance,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PointEntity } from '../entities/point.entity';
import { PointStatusEntity } from 'src/modules/nomencladores/point-status/entities/point-status.entity';
import { AddressEntity } from 'src/modules/nomencladores/geolocation/entities/address.entity';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { BeneficiaryEntity } from 'src/modules/beneficiary/entities/beneficiary.entity';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';
import { PointAssetsEntity } from '../entities/point-assets.entity';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';
import { TYPE_OF_POINT } from 'src/constants/enums';

export class AssignCitizenDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  citizen_id: string;
}

export class PointFiltersDTO {
  country?: string;
  region?: string;
  province?: string;
  canton?: string;
  parish?: string;
  name?: string;
}

export class AssignPointDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
export class PointDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  agreement?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  status?: Partial<PointStatusEntity>;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  address?: Partial<AddressEntity>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  hasAgreements?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCsr?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  facilitator_employee?: Partial<EmployeeEntity>;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  technical_asistent_employee?: Partial<EmployeeEntity>;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  beneficiary?: Partial<BeneficiaryEntity>;

  @ApiProperty()
  @IsNotEmpty()
  @IsIP()
  ip: string;


  
  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_POINT)
  type?: TYPE_OF_POINT

}

export class PointReportsDTO{
  total_visits: number
  login_count: number
  virtual_visits: number
  facetoface_visits: number
  service_visits: number
  total_courses: number
  point_assets: Array<PointAssetsEntity>
  point_conectivities: Array<ConectivityEntity>
}

export class PointUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  agreement?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  status?: Partial<PointStatusEntity>;

  @ApiProperty()
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  facilitator_employee?: Partial<EmployeeEntity>;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  technical_asistent_employee?: Partial<EmployeeEntity>;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_POINT)
  type?: TYPE_OF_POINT

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  hasAgreements?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCsr?: boolean;


  @ApiProperty()
  @IsOptional()
  @IsObject()
  beneficiary?: Partial<BeneficiaryEntity>;
}

export class PointResultDTO {
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
  data: PointEntity[];
}

export class FindPointDTO<T extends keyof PointDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(PointDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}

export class PointAvailabilityDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code_pde: string;

  @ApiProperty()
  country_pde: string;

  @ApiProperty()
  region_pde: string;

  @ApiProperty()
  province_pde: string;

  @ApiProperty()
  canton_pde: string;

  @ApiProperty()
  parish_pde: string;

  @ApiProperty()
  name_pde: string;

  @ApiProperty()
  connectivity: string;

  @ApiProperty()
  tman: number;

  @ApiProperty()
  tmov: number;

  @ApiProperty()
  tfault: number;

  @ApiProperty()
  tpen: number;

  @ApiProperty()
  monthly_fee_pde: number;

  @ApiProperty()
  value_to_pay: number;

  @ApiProperty()
  discount_of_unavailability: number;

  @ApiProperty()
  sub_total_monthly_fee_pde: number;

  @ApiProperty()
  speed: string;

  @ApiProperty()
  d: number;

  @ApiProperty()
  ti: number;

  @ApiProperty()
  tm: number;

  @ApiProperty()
  tt: number;

  @ApiProperty()
  fcs: number;
}
