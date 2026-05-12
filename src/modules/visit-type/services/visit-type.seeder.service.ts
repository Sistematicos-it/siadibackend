import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VisitTypeEntity } from '../entities/visit-type.entity';
import { Repository } from 'typeorm';
import { IVisitType } from '../interfaces/visit-type.interface';
import { VisitTypes } from 'src/constants/visit-types';

@Injectable()
export class DatabaseSeederVisitTypeService {
  constructor(
    @InjectRepository(VisitTypeEntity)
    private readonly VisitTypeRepository: Repository<VisitTypeEntity>,
  ) {}

  async seedVisitTypes() {
    const [visit_types, amount] = await this.VisitTypeRepository.findAndCount();

    if (amount === 0) {
      await this.VisitTypeRepository.save(VisitTypes);
    } else {
      let missing_types: IVisitType[] = [];

      visit_types.forEach((cnst_type) => {
        if (
          !VisitTypes.find((type) => {
            return cnst_type.name === type.name;
          })
        ) {
          missing_types.push(cnst_type);
        }
      });

      if (missing_types.length > 0) {
        await this.VisitTypeRepository.save(missing_types);
      }
    }
  }
}
