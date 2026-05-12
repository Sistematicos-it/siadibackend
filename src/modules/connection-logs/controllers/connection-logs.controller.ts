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
import { ConnectionLogsService } from '../services/connection-logs.service';
import {
  FindConnectionLogsDTO,
  ConnectionLogsDTO,
  ConnectionLogsUpdateDTO,
} from '../dto/connection-logs.dto';

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
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@ApiTags('ConnectionLogs') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('connectionLogs')
@UseGuards(AuthGuard, RolesGuard)
export class ConnectionLogsController {
  constructor(private readonly ConnectionLogsService: ConnectionLogsService) {}

  // @PublicAccess()
  /**
   * Registrar ConnectionLogs
   * @param body Datos del connectionLogse a registrar
   * @returns Datos del connectionLogse registrado
   */

  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar ConnectionLogse',
    description: 'Registra una nueva ConnectionLogse',
  })
  // @ApiBody({ type: ConnectionLogsDTO })
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
    description: 'ConnectionLogse registrado exitosamente',
    type: ConnectionLogsDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async registerConnectionLogs(
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.ConnectionLogsService.createConnectionLogs(
      req.idUser,
      files,
    );
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
  @Roles('FACILITATOR')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los ConnectionLogs',
    description:
      'Obtiene una lista de todas los ConnectionLogs según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de ConnectionLogs obtenida exitosamente',
    type: [ConnectionLogsDTO],
  })
  public async findAllConnectionLogs(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.ConnectionLogsService.findConnectionLogs(
      +page,
      +limit,
      req,
    );
  }

  // @PublicAccess()
  /**
   * Obtener una connectionLogse por su ID
   * @param id ID de el connectionLogse a obtener
   * @returns connectionLogse correspondiente al ID proporcionado
   */

  @Roles('TECHNICAL_CHIEF', 'TECHNICAL_ASSISTENT', 'FACILITATOR')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una ConnectionLogse por su ID',
    description:
      'Obtiene la ConnectionLogse correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ConnectionLogse',
    type: String,
  })
  @ApiOkResponse({
    description: 'ConnectionLogse obtenida exitosamente',
    type: ConnectionLogsDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la ConnectionLogse con el ID proporcionado',
  })
  public async findConnectionLogsById(@Param('id') id: string) {
    return await this.ConnectionLogsService.findConnectionLogsById(id);
  }

  /**
   * Buscar un connectionLogse por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns connectionLogse que coincide con los parámetros de búsqueda
   */

  @Roles('TECHNICAL_CHIEF', 'TECHNICAL_ASSISTENT', 'FACILITATOR')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una ConnectionLogse por cualquier clave y valor',
    description:
      'Busca una ConnectionLogse que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'ConnectionLogse encontrado exitosamente',
    type: ConnectionLogsDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ConnectionLogsDTO; value: string },
  ) {
    return await this.ConnectionLogsService.findBy({
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

  @Roles('TECHNICAL_CHIEF', 'FACILITATOR')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una ConnectionLogse',
    description:
      'Actualiza una ConnectionLogse existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la ConnectionLogse a actualizar',
    type: String,
  })
  @ApiBody({
    type: ConnectionLogsUpdateDTO,
    description: 'Datos de actualización de la ConnectionLogse',
  })
  @ApiOkResponse({
    description: 'ConnectionLogse actualizada exitosamente',
    type: ConnectionLogsDTO,
  })
  public async updateConnectionLogs(
    @Param('id') id: string,
    @Body() body: ConnectionLogsUpdateDTO,
  ) {
    return await this.ConnectionLogsService.updateConnectionLogs(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una connectionLogse
   * @param id Identificador de el connectionLogse a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('TECHNICAL_CHIEF', 'FACILITATOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una ConnectionLogse',
    description:
      'Elimina una ConnectionLogse según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la ConnectionLogse a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'ConnectionLogse eliminado exitosamente',
    type: String,
  })
  public async deleteConnectionLogs(@Param('id') id: string) {
    return await this.ConnectionLogsService.deleteConnectionLogs(id);
  }
}
