import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateExchangeEntity } from './entities/certificate-exchange.entity';
import { CertificateExchangeService } from './services/certificate-exchange.service';
import { CertificateExchangeController } from './controllers/certificate-exchange.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CertificateExchangeEntity])],
  providers: [CertificateExchangeService],
  controllers: [CertificateExchangeController],
  exports: [CertificateExchangeService, TypeOrmModule],
})
export class CertificateExchangeModule {}
