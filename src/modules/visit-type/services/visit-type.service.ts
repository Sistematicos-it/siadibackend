import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitTypeEntity } from '../entities/visit-type.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { VisitTypeDTO, VisitTypeResultDTO } from '../dto/visit-type.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { InstitutionService } from 'src/modules/nomencladores/institution/services/institution.service';
import { PoliticalLineService } from 'src/modules/nomencladores/political-line/services/political-line.service';
import { ProfessionalTitleService } from 'src/modules/nomencladores/professional-title/services/professional-title.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';
import { FileOptionsDTO } from 'src/modules/file/dto/file.dto';
import { FileService } from 'src/modules/file/services/file.service';

@Injectable()
export class VisitTypeService {
  constructor(
    @InjectRepository(VisitTypeEntity)
    private readonly VisitTypeRepository: Repository<VisitTypeEntity>,
  ) {}

  public async findVisitType() {
    try {
      const queryBuilder =
        this.VisitTypeRepository.createQueryBuilder('visit_type');

      const VisitType = await queryBuilder

        .orderBy('visit_type.updatedAt', 'DESC')

        .getMany();
      return VisitType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof VisitTypeDTO; value: any }) {
    try {
      const VisitType = await this.VisitTypeRepository.createQueryBuilder(
        'visit_type',
      )
        .where({ [key]: value })

        .getOne();

      return VisitType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findVisitTypeById(id: string): Promise<VisitTypeEntity> {
    try {
      const VisitType: VisitTypeEntity =
        await this.VisitTypeRepository.createQueryBuilder('visit_type')
          .where({ id })

          .getOne();
      return VisitType;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
