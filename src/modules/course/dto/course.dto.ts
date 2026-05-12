import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CourseEntity } from '../entities/course.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';
import { ProgramEntity } from 'src/modules/nomencladores/program/entities/program.entity';
import { AssignPointDTO } from 'src/modules/points/dto/point.dto';
import { AssignProgramDTO } from 'src/modules/nomencladores/program/dto/program.dto';

export class AssignCourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
export class CourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  start_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  end_date: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  week_days_amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  catalog_id?: string;
}

export class AttendCourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}

export class CourseUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  week_days_amount?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  catalog_id?: string;
}

export class CourseResultDTO {
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
  data: CourseEntity[];
}

export class FindCourseDTO<T extends keyof CourseDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(CourseDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
