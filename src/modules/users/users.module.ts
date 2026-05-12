import { Global, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { DatabaseSeederAdminUserService } from './services/dataBaseSeederAdminUser.service';
import { OtpCodeEntity } from './entities/otp.entity';
import { OtpCodeService } from './services/otp.service';
import { EmailService } from '../email/services/email.service';

@Global() //Esto hace que este modulo sea de manera global en toda la aplicacion y no tenga que estar importandolo
@Module({
  // imports: [TypeOrmModule.forFeature([UserEntity])],
  imports: [TypeOrmModule.forFeature([UserEntity, OtpCodeEntity])],
  providers: [UsersService, DatabaseSeederAdminUserService, OtpCodeService, EmailService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule, DatabaseSeederAdminUserService, OtpCodeService, EmailService],
})
export class UsersModule {}
