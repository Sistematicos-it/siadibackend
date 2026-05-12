import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GENDERS, MARITAL_STATUS } from '../interfaces/employee.interface';
import { EmployeeEntity } from '../entities/employee.entity';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { ProfessionalTitleEntity } from 'src/modules/nomencladores/professional-title/entities/professional-title.entity';
import { EducationLevelEntity } from 'src/modules/nomencladores/education-level/entities/education-level.entity';
import { SpecializationEntity } from 'src/modules/nomencladores/specializations/entities/specialization.entity';
import { EmployeePeriodsEntity } from '../entities/employee_periods.entity';
import {
  EmployeePeriodDTO,
  EmployeePeriodUpdateDTO,
  EmployeePeriodsDTO,
  PeriodUpdateDTO,
  PeriodsUpdateDTO,
  VulnerabilityPeriodDTO,
  VulnerabilityPeriodUpdateDTO,
  VulnerabilityPeriodsDTO,
  VulnerabilityPeriodsUpdateDTO,
} from './employee-period.dto';
import { Type } from 'class-transformer';

export class RessignRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
export class AssignEmployeeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class AssignEmployeeRoleDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  boss_id?: string;
}

export class AssignEmployeeSubordinateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  subordinate_id: string;
}

export class UpdateCommandChainDTO {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  boss_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  subordinate_id?: string;
}

export class ReassignCommandChainDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  old_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  new_id?: string;
}

export class CommandChainResultDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  manager: EmployeeEntity;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  coordinator: EmployeeEntity;
}

export class EmployeeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_value: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facebook_profile?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  sign_authorization: boolean;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsOptional()
  @IsEnum(GENDERS)
  gender: GENDERS;

  @ApiProperty({
    enum: [
      'SOLTERO',
      'CASADO',
      'VIUDO',
      'DIVORCIADO',
      'UNION LIBRE',
      'UNION DE HECHO',
    ],
  })
  @IsOptional()
  @IsEnum(MARITAL_STATUS)
  marital_status: MARITAL_STATUS;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  professional_title: ProfessionalTitleEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  education_level: EducationLevelEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  specialization: SpecializationEntity;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => EmployeePeriodDTO)
  periods: EmployeePeriodsDTO;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => VulnerabilityPeriodDTO)
  vulnerability_periods: VulnerabilityPeriodsDTO;
}

export class EmployeeUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  id_value?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  facebook_profile?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  sign_authorization?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(MARITAL_STATUS)
  marital_status?: MARITAL_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  professional_title?: ProfessionalTitleEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  education_level?: EducationLevelEntity;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  specialization?: SpecializationEntity;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => EmployeePeriodUpdateDTO)
  periods: Array<EmployeePeriodUpdateDTO>;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @Type(() => VulnerabilityPeriodUpdateDTO)
  vulnerability_periods: VulnerabilityPeriodUpdateDTO[];
}

export class TransferDTO {

  @ApiProperty()
  @IsOptional()
  @IsString()
  reason?: string;

}

export class EmployeeResultDTO {
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
  data: EmployeeEntity[];
}

export class FindEmployeeDTO<T extends keyof EmployeeDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(EmployeeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
