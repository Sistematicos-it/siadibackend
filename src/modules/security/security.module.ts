import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityLogsEntity } from './entities/security.entity';
import { SecurityService } from './services/security.service';
import { SecurityController } from './controllers/security.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SecurityLogsEntity])],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService, TypeOrmModule],
})
export class SecuritysModule {}
