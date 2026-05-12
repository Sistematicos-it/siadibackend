import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity } from './entities/work-order.entity';
import { WorkOrderService } from './services/work-order.service';
import { WorkOrderController } from './controllers/work-order.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderEntity])],
  providers: [WorkOrderService],
  controllers: [WorkOrderController],
  exports: [WorkOrderService, TypeOrmModule],
})
export class WorkOrderModule {}
