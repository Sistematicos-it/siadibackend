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
import { LoginReasonOfVisitEntity } from '../entities/login-reason-visit.entity';

export class LoginReasonOfVisitDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug: string;
}

export class LoginReasonOfVisitUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}


export class LoginReasonOfVisitResultDTO {
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
  data: LoginReasonOfVisitEntity[];
}

export class FindLoginReasonOfVisitDTO<T extends keyof LoginReasonOfVisitDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(LoginReasonOfVisitDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
