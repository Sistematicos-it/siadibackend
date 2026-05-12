import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity])],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService, TypeOrmModule],
})
export class ReportsModule {}
