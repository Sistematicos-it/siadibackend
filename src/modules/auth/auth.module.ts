import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersService } from 'src/modules/users/services/users.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UserLoginReasonOfVisitService } from '../login-reason-visit/services/user-login-reason-visit.service';
import { LoginReasonOfVisitService } from '../login-reason-visit/services/login-reason-visit.service';

@Global()
@Module({
  imports: [UsersModule],
  providers: [AuthService, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
