import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VULNERABILITY_STATUS } from 'src/constants/enums';

export class EmployeePeriodDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  start_date: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  end_date?: string;
}

export class VulnerabilityPeriodDTO {
  @ApiProperty()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty()
  @IsOptional()
  end_date?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(VULNERABILITY_STATUS)
  status: VULNERABILITY_STATUS;
}

export class VulnerabilityPeriodUpdateDTO {
  @ApiProperty()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsOptional()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(VULNERABILITY_STATUS)
  status?: VULNERABILITY_STATUS;
}

export class EmployeePeriodsDTO extends Array<EmployeePeriodDTO> {}

export class VulnerabilityPeriodsDTO extends Array<VulnerabilityPeriodDTO> {}
export class VulnerabilityPeriodsUpdateDTO extends Array<VulnerabilityPeriodUpdateDTO> {}

export class PeriodUpdateDTO {
  @ApiProperty({
    required: false,
    description:
      'Si no se provee una id se creara un periodo nuevo con los datos',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  end_date?: string;
}

export class PeriodsUpdateDTO extends Array<PeriodUpdateDTO> {}

export class EmployeePeriodUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  end_date?: string;
}

export class EmployeePeriodsFileDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  file: string;
}
export class AddFileToPeriodDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  file: string;
}
