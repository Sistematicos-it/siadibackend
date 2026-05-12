import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailDTO, EmailProviderDTO, RessignEmailDTO } from '../dto/email.dto';
import { EMAIL_TYPE } from 'src/constants/email';
import { otpMailTemplate } from 'src/utils/otp-mail.template';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { getContactMailTemplate } from 'src/utils/contact-mail.template';
import { UsersService } from 'src/modules/users/services/users.service';
import { getRessignMailTemplate } from 'src/utils/ressign-mail.template';
import { incidentMailTemplate } from 'src/utils/incident-mail.template';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';

ConfigModule.forRoot();

const configService = new ConfigService();
@Injectable()
export class EmailService {
  constructor(
    private readonly emailService: MailerService,

    private readonly citizenService: CitizenService,

    private readonly UserService: UsersService,
  ) {}

 async sendEmail(payload: EmailDTO) {
    const html = otpMailTemplate(
      configService.get('APP_LOGO'),
      payload.message,
    );
    const res = await this.emailService.sendMail({
      to: payload.email,
      from: process.env.EMAIL_SIADI,
      subject: payload.subject,
      text: payload.message,
      html,
    });


    

  }

  public async sendEmailProvider(user_id: string, payload: EmailDTO) {
    const citizen = await this.citizenService.findByUserId(user_id);

    const mailData = {
      name: citizen?.name ? citizen?.name : '-',
      phone: citizen?.phone ? citizen?.phone : '-',
      email: payload?.email,
      company: payload.company,
      message: payload.message,
    };

    const html = getContactMailTemplate(mailData);

    this.emailService.sendMail({
      to: payload.email,
      from: process.env.EMAIL_SIADI,
      subject: payload.subject,
      text: payload.message,
      html,
    });
  }

  public async sendRessignEmail(user_id: string, payload: RessignEmailDTO) {
    const user = await this.UserService.findUserById(user_id);

    const html = getRessignMailTemplate(payload);

   const sended = await this.emailService.sendMail({
      to: user.email,
      from: process.env.EMAIL_SIADI,
      subject: `Renuncia`,
      text: `Notificacion de renuncia del empleado ${payload.name}`,
      html,
    });

    return sended
  }

  async sendIncidentEmail(payload: IncidentEntity, boss?: string) {
    // Construir el HTML del correo usando la plantilla        
    console.log(payload);
    const html = incidentMailTemplate(configService.get('APP_LOGO'), payload);
    const subject = "Notificación sobre incidente";    
    let destinatarios = new Array<string>;
    let message = "Se le notifica que se ha generado/actualizado el incidente No." 
                   + (payload?.incident_number || 'N/A')
                   + " en el sistema SIADI. A continuación, se muestran los datos del caso:";
    if(payload?.requester)
      destinatarios.push(payload?.requester?.email); // agrega al solicitante
    if(payload?.assigned_to)
      destinatarios.push(payload?.assigned_to?.email); // agrega al asignado               
    if(boss){
      destinatarios.push(boss);  // agrega al jefe del asignado
    }
    if(process.env.EXTRA_DESTINATION_INCIDENTS) 
      destinatarios.push(process.env.EXTRA_DESTINATION_INCIDENTS);  //agrega la lista de adicionales 
    // Se construye y envía el correo
    const res = await this.emailService.sendMail({
        to: destinatarios,
        from: process.env.EMAIL_SIADI,
        subject: subject,
        text: message,
        html,
    });
    //console.log(res);
  }  
}
