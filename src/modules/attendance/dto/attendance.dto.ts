import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIP,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AttendanceEntity } from '../entities/attendance.entity';
import { TYPE_OF_ATTENDANCE } from 'src/constants/enums';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';

export class AttendanceDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_ATTENDANCE)
  attendanceType?: TYPE_OF_ATTENDANCE;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  attendanceDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;
}

export class SubordinatesAttendaceAllDTO {
  subordinate_nui: string
  subordinate_name: string
  total_hours: number
  daysUnnmarked: number
}

export class SubordinatesAttendancesAllArrayDTO extends Array<SubordinatesAttendaceAllDTO> {}

export class SubordinatesAttendancesAllResult {
  start_date: string
  end_date: string
  data: SubordinatesAttendancesAllArrayDTO
}
export class ArrangedAttendancesDTO {
  date: Date
  attendances: AttendanceEntity[]
}

export class AttendanceUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(TYPE_OF_ATTENDANCE)
  attendanceType?: TYPE_OF_ATTENDANCE;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  attendanceDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observation?: string;
}

export class AttendanceResultDTO {
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
  data: AttendanceEntity[];
}

export class FindAttendanceDTO<T extends keyof AttendanceDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(AttendanceDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
