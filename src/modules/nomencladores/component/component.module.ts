import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentEntity } from './entities/component.entity';
import { ComponentService } from './services/component.service';
import { ComponentController } from './controllers/component.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ComponentEntity])],
  providers: [ComponentService],
  controllers: [ComponentController],
  exports: [ComponentService, TypeOrmModule],
})
export class ComponentsModule {}
