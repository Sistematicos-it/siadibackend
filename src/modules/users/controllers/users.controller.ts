import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  GenerateAndSendOTPDTO,
  FindUserDTO,
  ResetPasswordDTO,
  UserDTO,
  UserUpdateDTO,
  verifyOtpCodeDTO,
  CreateUserDTO,
  ChangePasswordDTO,
} from '../dto/user.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OtpCodeService } from '../services/otp.service';
import { UserId } from '../decorators/user.decorator';
import { Request } from 'express';
import { ErrorManager } from 'src/utils';

@ApiTags('Users') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,

    private readonly otpService: OtpCodeService,
  ) {}

  /**
   * Registrar nuevo usuario
   * @param body Información del usuario a registrar
   * @returns El usuario registrado
   */

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Registra un nuevo usuario',
  })
  @ApiBody({
    type: CreateUserDTO,
    description: 'Información del usuario a registrar',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado con éxito',
    type: UserDTO,
  })
  public async registerUser(@Body() body: UserDTO) {
    return await this.userService.createUser(body);
  }

  /**
   * Obtener todos los usuarios
   * @param page Número de página para la paginación de resultados (opcional)
   * @param limit Límite de usuarios por página para la paginación de resultados (opcional)
   * @param search Término de búsqueda para filtrar los usuarios por nombre, correo electrónico u otros criterios (opcional)
   * @returns Lista de usuarios según los parámetros de consulta
   */

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obtiene los datos de un usuario',
    description:
      'Obtiene los datos de un usuario a partir del token de autenticacion',
  })
  @ApiHeader({
    name: 'authorization',
    required: true,
    description: 'Header que contiene el token de acceso',
  })
  @ApiOkResponse({ description: 'Datos del usuario', type: UserDTO })
  public async userMe(@Req() req: Request) {
    try {
      return await this.userService.userMe(req.idUser);
    } catch (error) {
      console.log(error);
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN','HUMAN_TALENT')
  @Get('all')
  @ApiOperation({
    summary: 'Buscar todos los usuarios',
    description:
      'Busca y devuelve todos los usuarios según los parámetros de consulta',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Número de página para la paginación de resultados',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description:
      'Límite de usuarios por página para la paginación de resultados',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Término de búsqueda para filtrar los usuarios',
  })
  @ApiOkResponse({
    description: 'Lista de usuarios encontrados',
    type: UserDTO,
    isArray: true,
  })
  public async findAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.userService.findUsers(+page, +limit, search);
  }

  /**
   * Obtener usuario por ID
   * @param id ID del usuario a buscar
   * @returns Datos del usuario encontrado
   */

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario a buscar' })
  @ApiOkResponse({ description: 'Usuario encontrado', type: UserDTO })
  @ApiNotFoundResponse({
    description: 'No se encontró ningún usuario con el ID especificado',
  })
  public async findUserById(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar usuario por clave y valor',
    description: 'Busca un usuario según una clave y valor específicos',
  })
  @ApiParam({
    name: 'value',
    description: 'Valor para buscar el usuario',
  })
  @ApiParam({
    name: 'key',
    enum: ['email', 'username'],
    description: 'Clave para buscar el usuario (name, email, username)',
  })
  public async findByAny(
    @Param() params: { key: keyof UserDTO; value: string },
  ) {
    // return await this.userService.findUserById(id);
    return await this.userService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  /**
   * * Update user
   * @param id
   * @param body
   * @returns
   */
  // @PublicAccess()

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('edit/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario existente',
  })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  public async updateUser(
    @Param('id') id: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.userService.updateUser(id, body);
  }

  /**
   * * Eliminar usuario
   * @param id ID del usuario a eliminar
   * @returns Estado de la eliminación del usuario
   */

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario existente por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiOkResponse({ description: 'Usuario eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  public async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Cambiar la contraseña del usuario mediante codigo OTP',
  })
  @ApiBody({
    type: ResetPasswordDTO,
    description: 'Información de los parametros',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    const { email, otpCode, newPassword } = resetPasswordDto;

    // Verificar si el código OTP es válido
    const isOTPValid = await this.otpService.verifyOTP(email, otpCode);

    if (isOTPValid) {
      // Generar una nueva contraseña y actualizarla en la base de datos
      await this.userService.changePassword(email, newPassword);

      return { message: 'Contraseña restablecida exitosamente' };
    } else {
      return { message: 'El código OTP proporcionado no es válido' };
    }
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Cambiar la contraseña del usuario logueado',
  })
  @ApiBody({
    type: ChangePasswordDTO,
    description: 'Información de los parametros',
  })
  async changePassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ChangePasswordDTO,
  ) {
    const { new_password } = resetPasswordDto;

    await this.userService.changeUserPassword(
      req.idUser,
      new_password,
    );

    return { message: 'Contraseña cambiada exitosamente' };
  }

  @Post('generate-otp')
  @ApiOperation({
    summary: 'Generar y enviar un código OTP al correo electrónico del usuario',
  })
  @ApiBody({
    type: GenerateAndSendOTPDTO,
    description: 'Información del usuario a registrar',
  })
  @ApiOkResponse({ description: 'Código OTP generado y enviado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Error al generar o enviar el código OTP',
  })
  async generateAndSendOTP(
    @Body() generateAndSendOTPDto: GenerateAndSendOTPDTO,
  ): Promise<void> {
    try {
      const { email } = generateAndSendOTPDto;
      await this.otpService.generateAndSendOTP(email);
    } catch (error) {
      console.log(error);
      console.log(error);
    }
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Generar y enviar un código OTP al correo electrónico del usuario',
  })
  @ApiBody({
    type: verifyOtpCodeDTO,
    description: 'Información del usuario a registrar',
  })
  @ApiOkResponse({ description: 'Código OTP generado y enviado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Error al generar o enviar el código OTP',
  })
  async verifyOtpCode(
    @Body() generateAndSendOTPDto: verifyOtpCodeDTO,
  ): Promise<void> {
    try {
      const { email, otpCode } = generateAndSendOTPDto;
      const obj = await this.otpService.verifyOTP(email, otpCode);
      console.log(obj);
    } catch (error) {
      console.log(error);
      console.log(error);
    }
  }
}
