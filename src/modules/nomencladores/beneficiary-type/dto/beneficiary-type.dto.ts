import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BeneficiaryTypeEntity } from '../entities/beneficiary-type.entity';


export class AssignBeneficiaryTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
export class BeneficiaryTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class BeneficiaryTypeUpdateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name?: string;
}

export class BeneficiaryTypeResultDTO {
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
  data: BeneficiaryTypeEntity[];
}

export class FindBeneficiaryTypeDTO<T extends keyof BeneficiaryTypeDTO> {
  @ApiProperty()
  @IsString()
  @IsIn(Object.keys(BeneficiaryTypeDTO))
  key: T;

  @ApiProperty()
  @IsString()
  value: string;
}
