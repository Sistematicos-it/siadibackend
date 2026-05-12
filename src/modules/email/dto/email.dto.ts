import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EMAIL_TYPE } from 'src/constants/email';

export class RessignEmailDTO {
  point?: string;
  parish?: string;
  canton?: string;
  province?: string;

  name: string;
  nui?: string;
  role: string;
  phone?: string;
  email?: string;
  date: string;
}
export class EmailDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  company?: string;
}

export class EmailProviderDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EMAIL_TYPE)
  type: EMAIL_TYPE;

  @ApiProperty()
  @IsOptional()
  @IsString()
  NameTo?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  To: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  Cc?: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  Subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  TextBody: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  Send?: string;
}
