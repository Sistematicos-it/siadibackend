import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticalLineEntity } from './entities/political-line.entity';
import { PoliticalLineService } from './services/political-line.service';
import { PoliticalLineController } from './controllers/political-line.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PoliticalLineEntity])],
  providers: [PoliticalLineService],
  controllers: [PoliticalLineController],
  exports: [PoliticalLineService, TypeOrmModule],
})
export class PoliticalLinesModule {}
