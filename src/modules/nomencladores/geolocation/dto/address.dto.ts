import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AddressEntity } from '../entities/address.entity';


export class AssignAddressDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
export class AddressDTO {
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mainStreet: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  secondaryStreet: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  postalCode: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  longitude: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  parish: string;
}


export class AddressUpdateDTO {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mainStreet?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  secondaryStreet?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  postalCode?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  parish?: string;
}

export class AddressResultDTO {
  
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
  data: AddressEntity[];
}

export class FindAddressDTO<T extends keyof AddressDTO> {

  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(AddressDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
