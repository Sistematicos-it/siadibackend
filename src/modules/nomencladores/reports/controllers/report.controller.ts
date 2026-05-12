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
} from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { FindReportDTO, ReportDTO, ReportUpdateDTO } from '../dto/report.dto';

import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('Report') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('report')
@UseGuards(AuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly ReportService: ReportService) {}

  // @PublicAccess()
  /**
 * Registrar Report
 * @param body Datos del reporte a registrar
 * @returns Datos del reporte registrado
 */

    @Roles("TECHNICAL_CHIEF")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Reporte',
    description: 'Registra una nueva Reporte',
  })
  @ApiBody({ type: ReportDTO })
  @ApiCreatedResponse({
    description: 'Reporte registrado exitosamente',
    type: ReportDTO,
  })
  public async registerReport(@Body() body: ReportDTO) {
    return await this.ReportService.createReport(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las reportes
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las reportes
 * @returns Lista de reportes según los parámetros de consulta
 */
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los Reportes',
    description: 'Obtiene una lista de todas los Reportes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Reportes obtenida exitosamente',
    type: [ReportDTO],
  })
  public async findAllReport(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.ReportService.findReport(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una reporte por su ID
 * @param id ID de el reporte a obtener
 * @returns reporte correspondiente al ID proporcionado
 */
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Reporte por su ID',
    description: 'Obtiene la Reporte correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Reporte', type: String })
  @ApiOkResponse({
    description: 'Reporte obtenida exitosamente',
    type: ReportDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Reporte con el ID proporcionado' })
  public async findReportById(@Param('id') id: string) {
    return await this.ReportService.findReportById(id);
  }


  /**
 * Buscar un reporte por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns reporte que coincide con los parámetros de búsqueda
 */

  @Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Reporte por cualquier clave y valor',
    description: 'Busca una Reporte que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Reporte encontrado exitosamente',
    type: ReportDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ReportDTO; value: string },
  ) {
    
    return await this.ReportService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una reporte
 * @param id Identificador de el reporte a actualizar
 * @param body Datos de actualización de el reporte
 * @returns reporte actualizado
 */

    @Roles("TECHNICAL_CHIEF")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Reporte',
    description: 'Actualiza una Reporte existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Reporte a actualizar', type: String })
  @ApiBody({ type: ReportUpdateDTO, description: 'Datos de actualización de la Reporte' })
  @ApiOkResponse({
    description: 'Reporte actualizada exitosamente',
    type: ReportDTO,
  })
  public async updateReport(
    @Param('id') id: string,
    @Body() body: ReportUpdateDTO,
  ) {
    return await this.ReportService.updateReport(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una reporte
 * @param id Identificador de el reporte a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("TECHNICAL_CHIEF")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Reporte',
    description: 'Elimina una Reporte según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Reporte a eliminar', type: String })
  @ApiOkResponse({
    description: 'Reporte eliminado exitosamente',
    type: String,
  })
  public async deleteReport(@Param('id') id: string) {
    return await this.ReportService.deleteReport(id);
  }
}
