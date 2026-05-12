import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PointEntity } from './entities/point.entity';
import { PointService } from './services/point.service';
import { PointController } from './controllers/point.controller';
import { CitizenPointEntity } from './entities/citizen-point.entity';
import { PointVisitsEntity } from './entities/point-visits.entity';
import { PointAssetsEntity } from './entities/point-assets.entity';
import { PointHistoryEntity } from './entities/point-history.entity';
import { PointGeolocationStatusEntity } from './entities/point-by-geolocation.entity';
import { PointGeolocationVisitsEntity } from './entities/point-visit-by-geeolocation.entity';
import { PointCalculationsAvailabilityViewEntity } from './entities/point_calculations_availability_view.entity';
import { PointAvailabilityViewEntity } from './entities/point_availability_view.entity';
import { CoursesListGeolocationViewEntity } from './entities/courses_list_geolocation_view.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([
    PointEntity,
    CitizenPointEntity,
    PointVisitsEntity,
    PointAssetsEntity,
    PointHistoryEntity,
    PointGeolocationStatusEntity,
    PointGeolocationVisitsEntity,
    PointCalculationsAvailabilityViewEntity,
    PointAvailabilityViewEntity,
    CoursesListGeolocationViewEntity,
  ])],
  providers: [PointService],
  controllers: [PointController],
  exports: [PointService, TypeOrmModule],
})
export class PointModule {}
