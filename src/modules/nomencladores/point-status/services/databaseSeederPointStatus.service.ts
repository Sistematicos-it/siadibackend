import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointStatusEntity } from '../entities/point-status.entity';
import { POINT_STATUS } from 'src/constants/enums';

@Injectable()
export class DatabaseSeederPointStatusService {
  constructor(
    @InjectRepository(PointStatusEntity)
    private readonly StatusRepository: Repository<PointStatusEntity>,
  ) {}

  async seedStatus() {
    const status = [
      { name: POINT_STATUS.ACTIVE },
      { name: POINT_STATUS.UNNACTIVE },
      { name: POINT_STATUS.SUSPENDED },
      { name: POINT_STATUS.FUTURE_OPENING },
    ];

    const statusExists = await this.StatusRepository.find();

    let missing_status = [];
    status.forEach((cnst_stat) => {
      if (
        !statusExists.find((stat) => {
          return stat.name === cnst_stat['name'];
        })
      ) {
        missing_status.push(cnst_stat);
      }
    });

    if (missing_status.length > 0) {
      await this.StatusRepository.save(missing_status);
    }

    return missing_status;
  }
}
