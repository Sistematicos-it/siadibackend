import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoginReasonOfVisitService } from '../services/login-reason-visit.service';
import { FindLoginReasonOfVisitDTO, LoginReasonOfVisitDTO, LoginReasonOfVisitUpdateDTO } from '../dto/login-reason-visit.dto';

import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ErrorManager } from 'src/utils';
import { LoginReasonOfVisitEntity } from '../entities/login-reason-visit.entity';
import slugify from 'slugify';

@ApiTags('LoginReasonOfVisit') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('login-reason-visit')
// @UseGuards(AuthGuard, RolesGuard)
export class LoginReasonOfVisitController {
  constructor(private readonly LoginReasonOfVisitService: LoginReasonOfVisitService) {}

    // @PublicAccess()
  /**
 * Registrar FileCategory
 * @param body Datos de la institucion a registrar
 * @returns Datos de la institucion registrado
 */
  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Motivo de Visita',
    description: 'Registra una nueva Motivo de Visita',
  })
  @ApiBody({ type: LoginReasonOfVisitDTO })
  @ApiCreatedResponse({
    description: 'Motivo de Visita registrada exitosamente',
    type: LoginReasonOfVisitDTO,
  })
  public async registerFileCategory(@Body() body: LoginReasonOfVisitDTO) {
    const { name } = body;
    const nameExists = await this.LoginReasonOfVisitService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre del motivo ya existe');
    }
    return await this.LoginReasonOfVisitService.createLoginReasonOfVisit(body);
  }


  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los tipos de visita
   
   * @returns Lista de tipos de visita según los parámetros de consulta
   */

    @Roles("ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los tipos de visita',
    description:
      'Obtiene una lista de todaslos tipos de visita según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de tipos de visita obtenida exitosamente',
    type: [LoginReasonOfVisitDTO],
  })
  public async findAllLoginReasonOfVisit(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.LoginReasonOfVisitService.findLoginReasonOfVisit(+page, +limit, search);
  }

  // @PublicAccess()
  /**
   * Obtener una tipos de visita por su ID
   * @param id ID del tipos de visita a obtener
   * @returns tipos de visita correspondiente al ID proporcionado
   */
    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tipos de visita por su ID',
    description:
      'Obtiene la tipos de visita correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del tipos de visita', type: String })
  @ApiOkResponse({
    description: 'tipos de visita obtenida exitosamente',
    type: LoginReasonOfVisitDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la tipos de visita con el ID proporcionado',
  })
  public async findLoginReasonOfVisitById(@Param('id') id: string) {
    return await this.LoginReasonOfVisitService.findLoginReasonOfVisitById(id);
  }

  /**
   * Buscar un tipos de visita por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns tipos de visita que coincide con los parámetros de búsqueda
   */
    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una tipos de visita por cualquier clave y valor',
    description:
      'Busca una tipos de visita que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'tipos de visita encontrado exitosamente',
    type: LoginReasonOfVisitDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof LoginReasonOfVisitDTO; value: string },
  ) {
    return await this.LoginReasonOfVisitService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Motivo de Visita',
    description: 'Actualiza una Motivo de Visita existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del Motivo de Visita a actualizar', type: String })
  @ApiBody({ type: LoginReasonOfVisitUpdateDTO, description: 'Datos de actualización del Motivo de Visita' })
  @ApiOkResponse({
    description: 'Motivo de Visita actualizada exitosamente',
    type: LoginReasonOfVisitDTO,
  })
  public async updateLoginReasonOfVisit(
    @Param('id') id: string,
    @Body() body: LoginReasonOfVisitUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.LoginReasonOfVisitService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de motivo ya existe');
    }
    return await this.LoginReasonOfVisitService.updateLoginReasonOfVisit(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un motivo
 * @param id Identificador del motivo a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */
  @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un Motivo de Visita',
    description: 'Elimina un Motivo de Visita según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del Motivo de Visita a eliminar', type: String })
  @ApiOkResponse({
    description: 'Motivo de Visita eliminado exitosamente',
    type: String,
  })
  public async deleteLoginReasonOfVisit(@Param('id') id: string) {
    return await this.LoginReasonOfVisitService.deleteLoginReasonOfVisit(id);
  }
}
