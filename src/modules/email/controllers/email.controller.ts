import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { EmailDTO, EmailProviderDTO } from '../dto/email.dto';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Request } from 'express';

@ApiTags('Send Email') //Tags en el Swagger para separar los endpoint
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-email-local')
  @ApiOperation({
    summary: 'Enviar correo',
    description: 'Envio de correo para notificaciones',
  })
  @ApiBody({ type: EmailDTO, description: 'Enviar correo' })
  @ApiOkResponse({
    description: 'Correo enviado satisfactoriamente',
    type: String,
  })
  public async sendEmail(@Body() payload: EmailDTO) {
    return this.emailService.sendEmail(payload);
  }

  @UseGuards(AuthGuard)
  @Post('send-email-provider')
  @ApiOperation({
    summary: 'Enviar correo',
    description: 'Envio de correo para notificaciones mediante un proveedor',
  })
  @ApiBody({ type: EmailDTO, description: 'Enviar correo' })
  @ApiOkResponse({
    description: 'Correo enviado satisfactoriamente',
    type: String,
  })
  public async sendEmailWithProvider(
    @Req() req: Request,
    @Body() payload: EmailDTO,
  ) {
    return this.emailService.sendEmailProvider(req.idUser, payload);
  }
}
