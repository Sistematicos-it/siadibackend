import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ErrorManager } from '../../../utils/error.manager';
import { OtpCodeEntity } from '../entities/otp.entity';
import { generateOtpCode } from 'src/utils/generateOtpCode';
import { sendEmail } from 'src/utils/sendEmail';
import { OtpCodeDTO, OtpCodeUpdateDTO } from '../dto/user.dto';
import { EmailService } from 'src/modules/email/services/email.service';
import { EmailDTO, EmailProviderDTO } from 'src/modules/email/dto/email.dto';
import { EMAIL_TYPE } from 'src/constants/email';
import { UsersService } from './users.service';
import { calculateDifferenceInSeconds } from 'src/utils/helpers';

@Injectable()
export class OtpCodeService {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly otpCodeRepository: Repository<OtpCodeEntity>,
    private readonly userService: UsersService,
    private readonly sendMailService: EmailService,
  ) {}

  public async createOtpCode(body: OtpCodeDTO): Promise<OtpCodeEntity> {
    try {
      return await this.otpCodeRepository.save(body);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async findBy({ key, value }: { key: keyof OtpCodeDTO; value: any }) {
    try {
      const objOtpCode = await this.otpCodeRepository
        .createQueryBuilder('otpcode')
        .where({ [key]: value })
        .getOne();

      return objOtpCode;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  public async updateOtpCode(
    id: string,
    body: OtpCodeUpdateDTO,
  ): Promise<UpdateResult | undefined> {
    try {
      const objOtpCode: UpdateResult = await this.otpCodeRepository.update(id, body);
      if (objOtpCode.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar el registro',
        });
      }
      return objOtpCode;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteOtpCode(id: string): Promise<DeleteResult | undefined> {
    try {
      // const objOtpCode = await this.otpCodeRepository.findOneBy({ id });
      const user: DeleteResult = await this.otpCodeRepository.softDelete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar el registro',
        });
      }
      return user;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createOrUpdateOtpCode (body: OtpCodeDTO): Promise<void> {
    const otpCodeTemp = await this.findBy({key: 'email', value: body.email})
    if(otpCodeTemp) {
      await this.updateOtpCode(otpCodeTemp.id, body)
    } else {
      await this.createOtpCode(body)      
    }
  }

  public async verifyOTP(email: string, otpCode: string): Promise<boolean> {
    // Se cuenta si existe algun registro que cumpla con las condiciones establecida y devuelve true o false
    try {
      const objOtpCode = await this.otpCodeRepository.findOne({ where: { email, otpCode } })      
      if (objOtpCode) {
        if (calculateDifferenceInSeconds(objOtpCode.updatedAt) > Number(process.env.OTP_CODE_WAIT_TIME)) {
          return false
        } else {
          return true
        } 
      }
      return false;
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async generateAndSendOTP(email: string): Promise<void> {
    // Verificar si el correo electrónico existe y tiene un usuario asociado
    try {
      const user = await this.userService.findBy({key: 'email', value: email});      
      if (!user) {
        throw new Error('El correo electrónico no está asociado a ningún usuario');
      }
  
      // Generar un código OTP
      const otpCode = generateOtpCode();

      await this.userService.changePassword(user?.id, otpCode)
  
      // Guardar el código OTP en la base de datos
      const objToSave: OtpCodeDTO = {
        email,
        otpCode
      }
      await this.createOrUpdateOtpCode(objToSave);
  
      // Enviar el código OTP al correo electrónico del usuario
      const objEmail: EmailDTO = {
        email,
        subject: 'Código OTP',
        message: otpCode,
      }
      this.sendMailService.sendEmail(objEmail);
    } catch (error) {
      console.log(error);
      
    }
  }
}
