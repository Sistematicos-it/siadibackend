import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoleEntity } from '../entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RoleResultDTO {
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
  data: RoleEntity[];
}

export class RoleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role_value: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role_name: string;
}

export class AssignRoleToUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
