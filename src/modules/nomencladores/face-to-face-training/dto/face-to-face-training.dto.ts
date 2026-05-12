import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FaceToFaceTrainingEntity } from '../entities/face-to-face-training.entity';




export class FaceToFaceTrainingDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  hours: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  min_age?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  max_age?: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string


}

export class FaceToFaceTrainingUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  hours?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  min_age?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  max_age?: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  content?: string
}

export class FaceToFaceTrainingResultDTO {
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
  data: FaceToFaceTrainingEntity[];
}

export class FindFaceToFaceTrainingDTO<T extends keyof FaceToFaceTrainingDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(FaceToFaceTrainingDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}

