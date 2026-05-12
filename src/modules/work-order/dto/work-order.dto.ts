import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { WorkOrderEntity } from '../entities/work-order.entity';
import { WORKORDER_STATUS } from 'src/constants/enums';

export class WorkOrderDTO {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderNumber: string


  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  point_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  downloadLink: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uploadLink: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  availability: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  installationCost: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  monthlyValue: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  beneficiary: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  zoneCoordinator: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  applicant: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  authorizer: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  technology: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  sharing: string

}

export class WorkOrderUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  orderNumber?: string

  @ApiProperty()
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  point_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  downloadLink?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  uploadLink?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  availability?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  installationCost?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  monthlyValue?: number

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  beneficiary?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  zoneCoordinator?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  applicant?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  authorizer?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  technology?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  sharing?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(WORKORDER_STATUS)
  status?: WORKORDER_STATUS
}

export class WorkOrderResultDTO {
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
  data: WorkOrderEntity[];
}

export class FindWorkOrderDTO<T extends keyof WorkOrderDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(WorkOrderDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
