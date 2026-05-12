import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InstitutionService } from '../services/institution.service';
import {
  FindInstitutionDTO,
  InstitutionDTO,
  InstitutionUpdateDTO,
} from '../dto/institution.dto';

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

@ApiTags('Institution') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('institution')
@UseGuards(AuthGuard, RolesGuard)
export class InstitutionController {
  constructor(private readonly InstitutionService: InstitutionService) {}

  // @PublicAccess()
  /**
   * Registrar Institution
   * @param body Datos de la institucion a registrar
   * @returns Datos de la institucion registrado
   */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Institucion',
    description: 'Registra una nueva Institucion',
  })
  @ApiBody({ type: InstitutionDTO })
  @ApiCreatedResponse({
    description: 'Institucion registrada exitosamente',
    type: InstitutionDTO,
  })
  public async registerInstitution(@Body() body: InstitutionDTO) {
    return await this.InstitutionService.createInstitution(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las instituciones
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las instituciones
   * @returns Lista de instituciones según los parámetros de consulta
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Instituciones',
    description:
      'Obtiene una lista de todas las Instituciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Instituciones obtenida exitosamente',
    type: [InstitutionDTO],
  })
  public async findAllInstitution(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.InstitutionService.findInstitution(+page, +limit, search, req);
  }

  // @PublicAccess()
  /**
   * Obtener una institucion por su ID
   * @param id ID de la institucion a obtener
   * @returns institucion correspondiente al ID proporcionado
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Institucion por su ID',
    description: 'Obtiene la Institucion correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Institucion', type: String })
  @ApiOkResponse({
    description: 'Institucion obtenida exitosamente',
    type: InstitutionDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Institucion con el ID proporcionado',
  })
  public async findInstitutionById(@Param('id') id: string) {
    return await this.InstitutionService.findInstitutionById(id);
  }

  /**
   * Buscar un institucion por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns institucion que coincide con los parámetros de búsqueda
   */

    @Roles("HUMAN_TALENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Institucion por cualquier clave y valor',
    description:
      'Busca una Institucion que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Institucion encontrado exitosamente',
    type: InstitutionDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof InstitutionDTO; value: string },
  ) {
    return await this.InstitutionService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una institucion
   * @param id Identificador de la institucion a actualizar
   * @param body Datos de actualización de la institucion
   * @returns institucion actualizado
   */

    @Roles("HUMAN_TALENT")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Institucion',
    description:
      'Actualiza una Institucion existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Institucion a actualizar',
    type: String,
  })
  @ApiBody({
    type: InstitutionUpdateDTO,
    description: 'Datos de actualización de la Institucion',
  })
  @ApiOkResponse({
    description: 'Institucion actualizada exitosamente',
    type: InstitutionDTO,
  })
  public async updateInstitution(
    @Param('id') id: string,
    @Body() body: InstitutionUpdateDTO,
  ) {
    return await this.InstitutionService.updateInstitution(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una institucion
   * @param id Identificador de la institucion a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("HUMAN_TALENT")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Institucion',
    description: 'Elimina una Institucion según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Institucion a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Institucion eliminado exitosamente',
    type: String,
  })
  public async deleteInstitution(@Param('id') id: string) {
    return await this.InstitutionService.deleteInstitution(id);
  }
}
