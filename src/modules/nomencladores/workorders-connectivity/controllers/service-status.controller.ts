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
import {
  FindServiceStatusDTO,
  ServiceStatusDTO,
  ServiceStatusUpdateDTO,
} from '../dto/service-status.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
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
import { ServiceStatusService } from '../services/service-status.service';

@ApiTags('ServiceStatuss') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('service-status')
@UseGuards(AuthGuard, RolesGuard)
export class ServiceStatusController {
  constructor(private readonly countryService: ServiceStatusService) {}

  // @PublicAccess()
  /**
   * Registrar Estado del servicio
   * @param body Datos el Estado del servicio a registrar
   * @returns Datos el Estado del servicio registrado
   */

    @Roles("MONITOR")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Estado del servicio',
    description: 'Registra un nuevo Estado del servicio',
  })
  @ApiBody({ type: ServiceStatusDTO })
  @ApiCreatedResponse({
    description: 'Estado del servicio registrado exitosamente',
    type: ServiceStatusDTO,
  })
  public async registerServiceStatus(@Body() body: ServiceStatusDTO) {
    return await this.countryService.createServiceStatus(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todas las Estado del servicioes de equipo
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Estado del servicioes de equipo
   * @returns Lista de Estado del servicioes según los parámetros de consulta
   */

    @Roles("MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las Estado del servicioes de equipo',
    description:
      'Obtiene una lista de todas las Estado del servicioes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Estado del servicioes obtenida exitosamente',
    type: [ServiceStatusDTO],
  })
  public async findAllServiceStatus(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.countryService.findServiceStatus(+page, +limit, search);
  }

  // @PublicAccess()
  /**
   * Obtener un Estado del servicio por su ID
   * @param id ID el Estado del servicio a obtener
   * @returns Estado del servicio correspondiente al ID proporcionado
   */

    @Roles("MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un Estado del servicio por su ID',
    description: 'Obtiene el Estado del servicio correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID el Estado del servicio', type: String })
  @ApiOkResponse({
    description: 'Estado del servicio obtenido exitosamente',
    type: ServiceStatusDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el Estado del servicio con el ID proporcionado',
  })
  public async findServiceStatusById(@Param('id') id: string) {
    return await this.countryService.findServiceStatusById(id);
  }

  /**
   * Buscar un Estado del servicio por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Estado del servicio que coincide con los parámetros de búsqueda
   */

    @Roles("MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un Estado del servicio por cualquier clave y valor',
    description:
      'Busca un Estado del servicio que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({
    name: 'key',
    description: 'Clave de búsqueda',
    enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'],
  })
  @ApiOkResponse({
    description: 'Estado del servicio encontrado exitosamente',
    type: ServiceStatusDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ServiceStatusDTO; value: string },
  ) {
    // console.log(Object.keys(ServiceStatusDTO));

    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar un Estado del servicio
   * @param id Identificador el Estado del servicio a actualizar
   * @param body Datos de actualización el Estado del servicio
   * @returns Estado del servicio actualizado
   */

    @Roles("MONITOR")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un Estado del servicio',
    description:
      'Actualiza un Estado del servicio existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador el Estado del servicio a actualizar',
    type: String,
  })
  @ApiBody({
    type: ServiceStatusUpdateDTO,
    description: 'Datos de actualización el Estado del servicio',
  })
  @ApiOkResponse({
    description: 'Estado del servicio actualizado exitosamente',
    type: ServiceStatusDTO,
  })
  public async updateServiceStatus(
    @Param('id') id: string,
    @Body() body: ServiceStatusUpdateDTO,
  ) {
    return await this.countryService.updateServiceStatus(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar un Estado del servicio
   * @param id Identificador el Estado del servicio a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("MONITOR")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un Estado del servicio',
    description: 'Elimina un Estado del servicio según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador el Estado del servicio a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Estado del servicio eliminado exitosamente',
    type: String,
  })
  public async deleteServiceStatus(@Param('id') id: string) {
    return await this.countryService.deleteServiceStatus(id);
  }
}
