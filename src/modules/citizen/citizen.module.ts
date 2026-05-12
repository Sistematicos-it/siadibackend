import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CitizenEntity } from './entities/citizen.entity';
import { CitizenService } from './services/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { CitizenLoginEntity } from './entities/citizen-login.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CitizenEntity, CitizenLoginEntity])],
  providers: [CitizenService],
  controllers: [CitizenController],
  exports: [CitizenService, TypeOrmModule],
})
export class CitizenModule {}
