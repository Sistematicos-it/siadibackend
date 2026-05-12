import {
  IsBoolean,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AuthBody } from '../interfaces/auth.interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDTO implements AuthBody {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isCitizen: boolean;

  @ApiProperty()
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  loginReazonOfVisit?: string;
  
}
