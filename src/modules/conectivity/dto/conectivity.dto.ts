import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ConectivityEntity } from '../entities/conectivity.entity';
import { TechnologyEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/technology.entity';
import { SharingEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/sharing.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { SpeedEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/speed.entity';
import { ServiceStatusEntity } from 'src/modules/nomencladores/workorders-connectivity/entities/service-status.entity';

export class ConectivityDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  installationCost: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  monthlyValue: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  petition?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pilot?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  availability: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  technology: TechnologyEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  sharing: SharingEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  point: PointEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  speed: SpeedEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  serviceStatus: ServiceStatusEntity;
}

export class ConectivityUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  installationCost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  monthlyValue?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  petition?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pilot?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  availability?: number;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  technology?: TechnologyEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  sharing?: SharingEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  point?: PointEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  speed?: SpeedEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  serviceStatus?: ServiceStatusEntity;
}

export class ConectivityResultDTO {
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
  data: ConectivityEntity[];
}

export class FindConectivityDTO<T extends keyof ConectivityDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(ConectivityDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
