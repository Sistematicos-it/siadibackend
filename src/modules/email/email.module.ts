import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';


@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_SIADI,
          pass: process.env.EMAIL_PASS,
        },
      }
    })
  ],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
