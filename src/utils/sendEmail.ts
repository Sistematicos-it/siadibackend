import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  try {
    // Configuración del transporte de correo electrónico
    const transporter = nodemailer.createTransport({
      // Configura los detalles del servidor SMTP o utiliza un servicio de correo electrónico como Gmail
      // Consulta la documentación de Nodemailer para obtener más información sobre las opciones de configuración: https://nodemailer.com/smtp/
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'devjosek@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envía el correo electrónico
    await transporter.sendMail({
      from: 'your-email@example.com',
      to,
      subject,
      text: body,
    });

    console.log(`Correo electrónico enviado a ${to}`);
  } catch (error) {
      console.log(error);
    console.error('Error al enviar el correo electrónico:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
}
