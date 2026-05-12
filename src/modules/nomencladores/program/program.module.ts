import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from './entities/program.entity';
import { ProgramService } from './services/program.service';
import { ProgramController } from './controllers/program.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ProgramEntity])],
  providers: [ProgramService],
  controllers: [ProgramController],
  exports: [ProgramService, TypeOrmModule],
})
export class ProgramsModule {}
