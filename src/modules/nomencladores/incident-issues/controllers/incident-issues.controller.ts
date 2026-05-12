import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentIssuesService } from '../services/incident-issues.service';
import {
  FindIncidentIssuesDTO,
  IncidentIssuesDTO,
  IncidentIssuesUpdateDTO,
} from '../dto/incident-issues.dto';

import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('IncidentIssues') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('incident-issues')
@UseGuards(AuthGuard, RolesGuard)
export class IncidentIssuesController {
  constructor(private readonly IncidentIssuesService: IncidentIssuesService) {}

  // @PublicAccess()
  /**
   * Registrar IncidentIssues
   * @param body Datos de Asuntos de incidentes a registrar
   * @returns Datos de Asuntos de incidentes registrado
   */

    @Roles("TECHNICAL_CHIEF")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Asuntos de incidentes',
    description: 'Registra una nueva Asuntos de incidentes',
  })
  @ApiBody({ type: IncidentIssuesDTO })
  @ApiCreatedResponse({
    description: 'Asuntos de incidentes registrada exitosamente',
    type: IncidentIssuesDTO,
  })
  public async registerIncidentIssues(@Body() body: IncidentIssuesDTO) {
    return await this.IncidentIssuesService.createIncidentIssues(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los Asuntos de incidentes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar los Asuntos de incidentes
   * @returns Lista de Asuntos de incidentes según los parámetros de consulta
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "FACILITATOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los Asuntos de incidentes',
    description:
      'Obtiene una lista de todas los Asuntos de incidentes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Asuntos de incidentes obtenida exitosamente',
    type: [IncidentIssuesDTO],
  })
  public async findAllIncidentIssues(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request
  ) {
    return await this.IncidentIssuesService.findIncidentIssues(
      +page,
      +limit,
      req
    );
  }

  // @PublicAccess()
  /**
   * Obtener una institucion por su ID
   * @param id ID de Asuntos de incidentes a obtener
   * @returns institucion correspondiente al ID proporcionado
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "FACILITATOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Asuntos de incidentes por su ID',
    description:
      'Obtiene la Asuntos de incidentes correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la Asuntos de incidentes',
    type: String,
  })
  @ApiOkResponse({
    description: 'Asuntos de incidentes obtenida exitosamente',
    type: IncidentIssuesDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la Asuntos de incidentes con el ID proporcionado',
  })
  public async findIncidentIssuesById(@Param('id') id: string) {
    return await this.IncidentIssuesService.findIncidentIssuesById(id);
  }

  /**
   * Buscar un institucion por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns institucion que coincide con los parámetros de búsqueda
   */
    @Roles("TECHNICAL_CHIEF", "FACILITATOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Asuntos de incidentes por cualquier clave y valor',
    description:
      'Busca una Asuntos de incidentes que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Asuntos de incidentes encontrado exitosamente',
    type: IncidentIssuesDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof IncidentIssuesDTO; value: string },
  ) {
    return await this.IncidentIssuesService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una institucion
   * @param id Identificador de Asuntos de incidentes a actualizar
   * @param body Datos de actualización de Asuntos de incidentes
   * @returns institucion actualizado
   */
    @Roles("TECHNICAL_CHIEF")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Asuntos de incidentes',
    description:
      'Actualiza una Asuntos de incidentes existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Asuntos de incidentes a actualizar',
    type: String,
  })
  @ApiBody({
    type: IncidentIssuesUpdateDTO,
    description: 'Datos de actualización de la Asuntos de incidentes',
  })
  @ApiOkResponse({
    description: 'Asuntos de incidentes actualizada exitosamente',
    type: IncidentIssuesDTO,
  })
  public async updateIncidentIssues(
    @Param('id') id: string,
    @Body() body: IncidentIssuesUpdateDTO,
  ) {
    return await this.IncidentIssuesService.updateIncidentIssues(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una institucion
   * @param id Identificador de Asuntos de incidentes a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("TECHNICAL_CHIEF")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Asuntos de incidentes',
    description:
      'Elimina una Asuntos de incidentes según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Asuntos de incidentes a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Asuntos de incidentes eliminado exitosamente',
    type: String,
  })
  public async deleteIncidentIssues(@Param('id') id: string) {
    return await this.IncidentIssuesService.deleteIncidentIssues(id);
  }
}
