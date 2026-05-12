import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { FileEntity } from '../entities/file.entity';

export class FileDTO {
  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiProperty()
  @IsNotEmpty()
  file: Express.Multer.File;
}

export class FileUpdateDTO {
  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiProperty()
  @IsOptional()
  file?: Express.Multer.File;
}

export class FileResultDTO {
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
  data: FileEntity[];
}

export class FileOptionsDTO {
  @IsNotEmpty()
  @IsString()
  relationshipName: string;

  @IsNotEmpty()
  @IsUUID()
  valueRelationship: string;

  @IsNotEmpty()
  @IsString()
  moduleName: string;
}

export class FileOptionsToDeleteDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  relationshipName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  valueRelationship: string;
}

export class FileKeyToSearchDTO {
  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty()
  @IsUUID()
  training: string;
}

export class FindFileDTO<T extends keyof FileDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(FileDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
