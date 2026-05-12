import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginReasonOfVisitEntity } from './entities/login-reason-visit.entity';
import { LoginReasonOfVisitService } from './services/login-reason-visit.service';
import { LoginReasonOfVisitController } from './controllers/login-reason-visit.controller';
import { UserLoginReasonOfVisitEntity } from './entities/user_login-reason-visit.entity';
import { UserLoginReasonOfVisitService } from './services/user-login-reason-visit.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LoginReasonOfVisitEntity, UserLoginReasonOfVisitEntity])],
  providers: [LoginReasonOfVisitService, UserLoginReasonOfVisitService],
  controllers: [LoginReasonOfVisitController],
  exports: [LoginReasonOfVisitService, UserLoginReasonOfVisitService, TypeOrmModule],
})
export class LoginReasonOfVisitModule {}
