import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ReportConnectionLogsService } from '../services/report-connection-logs.service';
import {
  ReportConnectionLogsDTO,
  ReportConnectionLogsUpdateDTO,
} from '../dto/report-connection-logs.dto';

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
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('ReportConnectionLogs') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('report_connection_logs')
@UseGuards(AuthGuard, RolesGuard)
export class ReportConnectionLogsController {
  constructor(private readonly ReportConnectionLogsService: ReportConnectionLogsService) {}

  // @PublicAccess()
  /**
   * Registrar ReportConnectionLogs
   * @param body Datos del connectionLogse a registrar
   * @returns Datos del connectionLogse registrado
   */

  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar ReportConnectionLogse',
    description: 'Registra una nueva ReportConnectionLogse',
  })
  // @ApiBody({ type: ReportConnectionLogsDTO })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'ReportConnectionLogse registrado exitosamente',
    type: ReportConnectionLogsDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async registerReportConnectionLogs(
    @Req() req: Request,
    @Body() body: ReportConnectionLogsDTO
    ) {
    return await this.ReportConnectionLogsService.createReportConnectionLogs(req.idUser, body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las connectionLogses
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las connectionLogses
   * @returns Lista de connectionLogses según los parámetros de consulta
   */
  @Roles("FACILITATOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los ReportConnectionLogs',
    description:
      'Obtiene una lista de todas los ReportConnectionLogs según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de ReportConnectionLogs obtenida exitosamente',
    type: [ReportConnectionLogsDTO],
  })
  public async findAllReportConnectionLogs(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.ReportConnectionLogsService.findReportConnectionLogs(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una connectionLogse por su ID
   * @param id ID de el connectionLogse a obtener
   * @returns connectionLogse correspondiente al ID proporcionado
   */

  @Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una ReportConnectionLogse por su ID',
    description: 'Obtiene la ReportConnectionLogse correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la ReportConnectionLogse', type: String })
  @ApiOkResponse({
    description: 'ReportConnectionLogse obtenida exitosamente',
    type: ReportConnectionLogsDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la ReportConnectionLogse con el ID proporcionado',
  })
  public async findReportConnectionLogsById(@Param('id') id: string) {
    return await this.ReportConnectionLogsService.findReportConnectionLogsById(id);
  }

  /**
   * Buscar un connectionLogse por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns connectionLogse que coincide con los parámetros de búsqueda
   */

  @Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una ReportConnectionLogse por cualquier clave y valor',
    description:
      'Busca una ReportConnectionLogse que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'ReportConnectionLogse encontrado exitosamente',
    type: ReportConnectionLogsDTO,
  })
  public async findReportConnectionLogsByAny(
    @Param() params: { key: keyof ReportConnectionLogsDTO; value: string },
  ) {
    return await this.ReportConnectionLogsService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una connectionLogse
   * @param id Identificador de el connectionLogse a actualizar
   * @param body Datos de actualización de el connectionLogse
   * @returns connectionLogse actualizado
   */

  @Roles('TECHNICAL_CHIEF')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una ReportConnectionLogse',
    description:
      'Actualiza una ReportConnectionLogse existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la ReportConnectionLogse a actualizar',
    type: String,
  })
  @ApiBody({
    type: ReportConnectionLogsUpdateDTO,
    description: 'Datos de actualización de la ReportConnectionLogse',
  })
  @ApiOkResponse({
    description: 'ReportConnectionLogse actualizada exitosamente',
    type: ReportConnectionLogsDTO,
  })
  public async updateReportConnectionLogs(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: ReportConnectionLogsUpdateDTO,
  ) {
    return await this.ReportConnectionLogsService.updateReportConnectionLogs(id, req.idUser ,body);
  }

  // @PublicAccess()
  /**
   * Eliminar una connectionLogse
   * @param id Identificador de el connectionLogse a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('TECHNICAL_CHIEF')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una ReportConnectionLogse',
    description: 'Elimina una ReportConnectionLogse según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la ReportConnectionLogse a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'ReportConnectionLogse eliminado exitosamente',
    type: String,
  })
  public async deleteReportConnectionLogs(@Param('id') id: string) {
    return await this.ReportConnectionLogsService.deleteReportConnectionLogs(id);
  }
}
