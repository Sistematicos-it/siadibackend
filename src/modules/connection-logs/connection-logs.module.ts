import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionLogsEntity } from './entities/connection-logs.entity';
import { ConnectionLogsService } from './services/connection-logs.service';
import { ConnectionLogsController } from './controllers/connection-logs.controller';
import { ReportConnectionLogsEntity } from './entities/report-connection-logs.entity';
import { ReportConnectionLogsService } from './services/report-connection-logs.service';
import { ReportConnectionLogsController } from './controllers/report.connection-logs.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConnectionLogsEntity])],
  providers: [ConnectionLogsService],
  controllers: [ConnectionLogsController],
  exports: [ConnectionLogsService, TypeOrmModule],
})
export class ConnectionLogssModule {}
