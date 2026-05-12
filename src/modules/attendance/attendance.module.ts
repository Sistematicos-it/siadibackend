import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity])],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService, TypeOrmModule],
})
export class AttendanceModule {}
