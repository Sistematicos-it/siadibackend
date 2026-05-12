import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { CourseService } from './services/course.service';
import { CourseController } from './controllers/course.controller';
import { CourseAttendanceEntity } from './entities/course-attendance.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, CourseAttendanceEntity])],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService, TypeOrmModule],
})
export class CoursesModule {}
