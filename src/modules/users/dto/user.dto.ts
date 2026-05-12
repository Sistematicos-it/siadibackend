import {
  IsArray,
  IsEnum,
  IsIn,
  IsInstance,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ROLES } from '../../../constants/roles';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/users.entity';
import { RoleEntity } from 'src/modules/roles/entities/role.entity';
import { AssignRoleToUserDTO, RoleDTO } from 'src/modules/roles/dto/role.dto';

export class UserDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  role?: RoleDTO;

  isFirstTime?: boolean;
}

export class CreateUserDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  role?: AssignRoleToUserDTO;
}

export class UserPrescriptionDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;
}

export class UserUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  role: RoleEntity;
}

export class ResetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otpCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDTO {
 

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  new_password: string;
}

export class OtpCodeDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  otpCode: string;
}

export class OtpCodeUpdateDTO {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  otpCode?: string;
}

export class GenerateAndSendOTPDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class verifyOtpCodeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otpCode: string;
}

export class UserResultDTO {
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
  data: UserEntity[];
}

export class FindUserDTO<T extends keyof UserDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(UserDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
