import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateEntity } from './entities/certificate.entity';
import { CertificateService } from './services/certificate.service';
import { CertificateController } from './controllers/certificate.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CertificateEntity])],
  providers: [CertificateService],
  controllers: [CertificateController],
  exports: [CertificateService, TypeOrmModule],
})
export class CertificatesModule {}
