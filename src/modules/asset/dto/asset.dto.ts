import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AssetEntity } from '../entities/asset.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AssignAssetTypeDTO } from 'src/modules/nomencladores/asset-type/dto/asset-type.dto';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { Type } from 'class-transformer';
import { ASSET_OWNER, ASSET_STATUS } from 'src/constants/enums';

export class AssetDetailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  value?: string;
}

export class AssetDetailsDTO extends Array<AssetDetailDTO> {}

export class UpdateAssetDetailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  value?: string;
}

export class UpdateAssetDetailsDTO extends Array<UpdateAssetDetailDTO> {}

export class AssetResultDTO {
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
  data: AssetEntity[];
}

export class ReassignAssetsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  old_employee_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  new_employee_id: string;
}

export class AssetDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ASSET_OWNER)
  asset_owner?: ASSET_OWNER

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  type: AssignAssetTypeDTO;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  responsible_employee: EmployeeEntity;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ASSET_STATUS)
  status?: ASSET_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isOldProject?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => AssetDetailDTO)
  details?: AssetDetailsDTO;
}

export class UpdateAssetDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cnt_code?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ASSET_OWNER)
  asset_owner?: ASSET_OWNER

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ASSET_STATUS)
  status?: ASSET_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isOldProject?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  type?: AssignAssetTypeDTO;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  responsible_employee?: EmployeeEntity;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => UpdateAssetDetailDTO)
  details?: UpdateAssetDetailsDTO;
}

export class AssignAssetToUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
