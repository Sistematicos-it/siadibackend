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
import { PointStatusService } from '../services/point-status.service';
import {
  FindPointStatusDTO,
  PointStatusDTO,
  PointStatusUpdateDTO,
} from '../dto/point-status.dto';

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

@ApiTags('PointStatus') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('point-status')
@UseGuards(AuthGuard, RolesGuard)
export class PointStatusController {
  constructor(private readonly PointStatusService: PointStatusService) {}

  // @PublicAccess()
  /**
   * Registrar PointStatus
   * @param body Datos del estados a registrar
   * @returns Datos del estados registrado
   */

  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar estados',
    description: 'Registra una nueva estados',
  })
  @ApiBody({ type: PointStatusDTO })
  @ApiCreatedResponse({
    description: 'estados registrada exitosamente',
    type: PointStatusDTO,
  })
  public async registerPointStatus(@Body() body: PointStatusDTO) {
    return await this.PointStatusService.createPointStatus(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los estados
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos estados
   * @returns Lista de estados según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los estados',
    description:
      'Obtiene una lista de todaslos estados según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de estados obtenida exitosamente',
    type: [PointStatusDTO],
  })
  public async findAllPointStatus(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.PointStatusService.findPointStatus(+page, +limit, search);
  }

  // @PublicAccess()
  /**
   * Obtener una estados por su ID
   * @param id ID del estados a obtener
   * @returns estados correspondiente al ID proporcionado
   */

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una estados por su ID',
    description: 'Obtiene la estados correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del estados', type: String })
  @ApiOkResponse({
    description: 'estados obtenida exitosamente',
    type: PointStatusDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la estados con el ID proporcionado',
  })
  public async findPointStatusById(@Param('id') id: string) {
    return await this.PointStatusService.findPointStatusById(id);
  }

  /**
   * Buscar un estados por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns estados que coincide con los parámetros de búsqueda
   */

  @Roles('ADMIN')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una estados por cualquier clave y valor',
    description:
      'Busca una estados que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'estados encontrado exitosamente',
    type: PointStatusDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PointStatusDTO; value: string },
  ) {
    return await this.PointStatusService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una estados
   * @param id Identificador del estados a actualizar
   * @param body Datos de actualización del estados
   * @returns estados actualizado
   */

  @Roles('ADMIN')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una estados',
    description: 'Actualiza una estados existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del estados a actualizar',
    type: String,
  })
  @ApiBody({
    type: PointStatusUpdateDTO,
    description: 'Datos de actualización del estados',
  })
  @ApiOkResponse({
    description: 'estados actualizada exitosamente',
    type: PointStatusDTO,
  })
  public async updatePointStatus(
    @Param('id') id: string,
    @Body() body: PointStatusUpdateDTO,
  ) {
    return await this.PointStatusService.updatePointStatus(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una estados
   * @param id Identificador del estados a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una estados',
    description: 'Elimina una estados según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del estados a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'estados eliminado exitosamente',
    type: String,
  })
  public async deletePointStatus(@Param('id') id: string) {
    return await this.PointStatusService.deletePointStatus(id);
  }
}
