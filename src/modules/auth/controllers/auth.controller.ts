import {
  Body,
  Controller,
  Post,
  Get,
  UnauthorizedException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDTO } from '../dto/auth.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ROLES } from 'src/constants';
import { VisitRecordService } from 'src/modules/visit-record/services/visit-record.service';
import { VisitRecordDTO } from 'src/modules/visit-record/dto/visit-record.dto';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { InjectRepository } from '@nestjs/typeorm';
import { CitizenPointEntity } from 'src/modules/points/entities/citizen-point.entity';
import { Repository } from 'typeorm';
import { CitizenEntity } from 'src/modules/citizen/entities/citizen.entity';
import { SecurityLogsEntity } from 'src/modules/security/entities/security.entity';
import { SECURITY_ACTION } from 'src/modules/security/interfaces/security.interface';
import { SecurityService } from 'src/modules/security/services/security.service';
import { SecurityDTO } from 'src/modules/security/dto/security.dto';
import { Request } from 'express';
import { CitizenLoginEntity } from 'src/modules/citizen/entities/citizen-login.entity';
import DeviceDetector = require('device-detector-js');
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { EMPLOYEE_STATUS } from 'src/constants/enums';
import { UserLoginReasonOfVisitService } from 'src/modules/login-reason-visit/services/user-login-reason-visit.service';
import { LoginReasonOfVisitService } from 'src/modules/login-reason-visit/services/login-reason-visit.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Authentications') //Tags en el Swagger para separar los endpoint
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly visitService: VisitRecordService,
    private readonly CitizenService: CitizenService,
    @InjectRepository(CitizenPointEntity)
    private readonly CitizenPointRepository: Repository<CitizenPointEntity>,

    @InjectRepository(EmployeeEntity)
    private readonly EmployeeRepository: Repository<EmployeeEntity>,

    @InjectRepository(CitizenLoginEntity)
    private readonly CitizenLoginRepository: Repository<CitizenLoginEntity>,

    @InjectRepository(CitizenEntity)
    private readonly CitizenRepository: Repository<CitizenEntity>,

    private readonly SecurityLogsService: SecurityService,

    private readonly logingReazonOfVisit: LoginReasonOfVisitService,
    private readonly userLogingReazonOfVisit: UserLoginReasonOfVisitService
  ) { }


  @Get('logout')
  @UseGuards(AuthGuard)
  public async logout(@Req() req: Request) {

    const citizen = await this.CitizenService.findByUserId(req.idUser)

    if (!citizen) {
      return null
    }

    const citizenLogin = await this.CitizenLoginRepository.findOne({
      where: {
        citizen_id: citizen?.id
      }, order: {
        createdAt: 'DESC'
      }
    })

    return await this.CitizenLoginRepository.update(citizenLogin?.id, { logout_date: new Date() })


  }

  /**
   * Iniciar sesión
   * @param body Credenciales de usuario para el inicio de sesión
   * @returns El token JWT generado para el usuario autenticado
   */
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Inicia sesión con las credenciales de usuario proporcionadas',
  })
  @ApiBody({
    type: AuthDTO,
    description: 'Credenciales de usuario para el inicio de sesión',
  })
  @ApiOkResponse({ description: 'Inicio de sesión exitoso', type: String })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas o usuario no autorizado',
  })
  public async login(
    @Body() { username, password, isCitizen, code, ip, loginReazonOfVisit }: AuthDTO,
    @Req() req: Request,
  ) {
    // 1. Validar el usuario que se proporciona en el cuerpo de la solicitud
    const userValidate = await this.authService.validateUser(
      username,
      password,
    );

    // 2. Si el usuario no existe, lanzar una excepción de "No autorizado"
    if (!userValidate) {
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario no autorizado',
      );
    }

    if (isCitizen) {
      if (userValidate.role.role_value !== ROLES.CITIZEN) {
        throw new UnauthorizedException(
          'Usuario no autorizado, el usuario no es un ciudadano',
        );
      }

      const citizen = await this.CitizenService.findByUserId(userValidate.id);

      const citizenPoint = citizen?.point;

      if (citizenPoint?.code !== code) {
        throw new UnauthorizedException(
          'Usted no esta asignado a este punto del encuentro, solicite la asignacion al facilitador del punto del encuentro en el que esta presente',
        );
      }
    } else {
      if (userValidate.role.role_value === ROLES.CITIZEN) {
        throw new UnauthorizedException(
          'Usuario no autorizado, el usuario no tiene permisos para acceder al sistema',
        );
      }
    }

    if (userValidate.role.role_value === ROLES.CITIZEN) {
      // Para registrar la visita si es un ciudadano
      const citizen = await this.CitizenService.findByUserId(userValidate.id);

      if (citizen) {
        const visit: Partial<VisitRecordDTO> = {
          citizen: citizen,
          date: new Date(),
          visit_type: VISIT_TYPES.FACE_TO_FACE,
          point: citizen.point,
        };
        await this.visitService.createVisitRecord(visit);

        if (loginReazonOfVisit) {
          //Añadir registro de visitas del ciudadano con motivos de visita
          const objUserLoginReazon = await this.logingReazonOfVisit.findLoginReasonOfVisitById(loginReazonOfVisit);
          await this.userLogingReazonOfVisit.createUserLoginReasonOfVisit({
            citizen,
            loginReazonOfVisit: objUserLoginReazon ? objUserLoginReazon : null
          })
        }
      }
    }

    const security = new SecurityDTO();
    if (userValidate.role.role_value !== ROLES.CITIZEN) {
      const employee = await this.EmployeeRepository.findOne({
        where: { user: { id: userValidate.id } },
        relations: { user: true },
      });

      if (employee && employee.status === EMPLOYEE_STATUS.UNNACTIVE) {
        throw new UnauthorizedException(
          'Usted ha sido desvinculado del sistema',
        );
      }

      security.action = SECURITY_ACTION.EMPLOYEE_LOGIN;
    } else {
      const deviceDetector = new DeviceDetector();

      const userAgent = req.headers['user-agent'];

      console.log(req.headers);

      const clientDetail = deviceDetector.parse(userAgent);
      const browser = clientDetail?.client?.name;
      const browser_version = clientDetail?.client?.version;
      const device = clientDetail?.device?.type;
      const os = clientDetail?.os?.name;
      const os_version = clientDetail?.os?.version;

      /*console.log(deviceDetector);
      console.log(clientDetail);
      /*console.log(browser);
      console.log(browser_version);
      console.log(device);
      console.log(os);
      console.log(os_version);*/

      let _user_agent = null;

      if (device) {
        _user_agent = `${device === 'desktop' ? 'PC' : device
          } / ${os} ${os_version} / ${browser} ${browser_version}`;
      }

      const citizenLogin = new CitizenLoginEntity();

      const citizen = await this.CitizenService.findByUserId(userValidate.id);

      citizenLogin.citizen_id = citizen.id;
      citizenLogin.citizen_name = citizen.name;
      citizenLogin.ip = req.ip;
      citizenLogin.login_date = new Date();
      citizenLogin.browser = browser;
      citizenLogin.device = device === 'desktop' ? 'PC' : device;
      citizenLogin.os = os;
      citizenLogin.user_agent = _user_agent;
      citizenLogin.point = citizen.point;

      await this.CitizenLoginRepository.save(citizenLogin);

      security.action = SECURITY_ACTION.CITIZEN_LOGIN;
    }
    security.ip = req.ip;
    security.made_on = new Date();
    security.user_id = userValidate.id;

    await this.SecurityLogsService.createSecurity(security);

    // 3. Si el usuario existe, generar un token JWT para el usuario autenticado
    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresca el token de acceso' })
  @ApiQuery({ name: 'token', type: String, required: true })
  @ApiOkResponse({
    description: 'Token con tiempo de expiracion refrescado',
    type: String,
  })
  public async refreshToken(@Query('token') token: string) {
    return await this.authService.refreshToken(token);
  }
}
