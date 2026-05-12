import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningEntity } from './entities/planning.entity';
import { PlanningService } from './services/planning.service';
import { PlanningController } from './controllers/planning.controller';
import { PlanningAdvancedEntity } from './entities/planning-advanced.entity';
import { PlanningAdvancedService } from './services/planning-advanced.service';
import { PlanningAdvancedController } from './controllers/planning-advanced.controller';
import { FacilitatorPlanningEntity } from './entities/facilitator-planning.entity';
import { FacilitatorPlanningService } from './services/facilitator-planning.service';
import { FacilitatorPlanningController } from './controllers/facilitator-planning.controller';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanningEntity,
      PlanningAdvancedEntity,
      FacilitatorPlanningEntity,
    ]),
  ],
  providers: [
    PlanningService,
    PlanningAdvancedService,
    FacilitatorPlanningService,
  ],
  controllers: [
    PlanningController,
    PlanningAdvancedController,
    FacilitatorPlanningController,
  ],
  exports: [
    PlanningService,
    PlanningAdvancedService,
    FacilitatorPlanningService,
    TypeOrmModule,
  ],
})
export class PlanningsModule {}
