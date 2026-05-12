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
  ValidateNested,
} from 'class-validator';
import { AssetTypeEntity } from '../entities/asset-type.entity';
import { ASSET_CATEGORY } from '../interfaces/asset-type.interface';
import { AssetTypeDetailsEntity } from '../entities/asset-type-details.entity';
import { Type } from 'class-transformer';

export class AssignAssetTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class AssetTypeDetailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  required: boolean;
}

export class AssetTypeDetailsDTO extends Array<AssetTypeDetailDTO> {}

export class UpdateAssetTypeDetailDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class UpdateAssetTypeDetailsDTO extends Array<UpdateAssetTypeDetailDTO> {}

export class AssetTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['Tecnologico', 'Mobiliario'] })
  @IsNotEmpty()
  @IsEnum(ASSET_CATEGORY)
  category: ASSET_CATEGORY;

  @ApiProperty({ type: AssetTypeDetailsDTO })
  @IsOptional()
  @IsArray()
  @Type(() => AssetTypeDetailDTO)
  details: AssetTypeDetailsDTO;
}

export class AssetTypeUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ASSET_CATEGORY)
  category?: ASSET_CATEGORY;

  @ApiProperty({ type: UpdateAssetTypeDetailsDTO})
  @IsOptional()
  @IsArray()
  @Type(() => UpdateAssetTypeDetailDTO)
  details?: UpdateAssetTypeDetailsDTO;
}

export class AssetTypeResultDTO {
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
  data: AssetTypeEntity[];
}

export class FindAssetTypeDTO<T extends keyof AssetTypeDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(AssetTypeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}

export class AssetTypeDetailsResultDTO {
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
  data: AssetTypeDetailsEntity[];
}
