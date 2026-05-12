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
import { FindSharingDTO, SharingDTO, SharingUpdateDTO } from '../dto/sharing.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SharingService } from '../services/sharing.service';

@ApiTags('Sharings') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('sharing')
@UseGuards(AuthGuard, RolesGuard)
export class SharingController {
  constructor(private readonly countryService: SharingService) {}

  // @PublicAccess()
  /**
 * Registrar Ocupación
 * @param body Datos la Ocupación a registrar
 * @returns Datos la Ocupación registrado
 */

    @Roles("MONITOR")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Ocupación',
    description: 'Registra un nuevo Ocupación',
  })
  @ApiBody({ type: SharingDTO })
  @ApiCreatedResponse({
    description: 'Ocupación registrado exitosamente',
    type: SharingDTO,
  })
  public async registerSharing(@Body() body: SharingDTO) {
    return await this.countryService.createSharing(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todas las Ocupaciónes de equipo
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las Ocupaciónes de equipo
 * @returns Lista de Ocupaciónes según los parámetros de consulta
 */

    @Roles("MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las Ocupaciónes de equipo',
    description: 'Obtiene una lista de todas las Ocupaciónes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Ocupaciónes obtenida exitosamente',
    type: [SharingDTO],
  })
  public async findAllSharing(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.countryService.findSharing(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una Ocupación por su ID
 * @param id ID la Ocupación a obtener
 * @returns Ocupación correspondiente al ID proporcionado
 */

    @Roles("MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Ocupación por su ID',
    description: 'Obtiene la Ocupación correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID la Ocupación', type: String })
  @ApiOkResponse({
    description: 'Ocupación obtenido exitosamente',
    type: SharingDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Ocupación con el ID proporcionado' })
  public async findSharingById(@Param('id') id: string) {
    return await this.countryService.findSharingById(id);
  }


  /**
 * Buscar una Ocupación por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Ocupación que coincide con los parámetros de búsqueda
 */

    @Roles("MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Ocupación por cualquier clave y valor',
    description: 'Busca una Ocupación que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Ocupación encontrado exitosamente',
    type: SharingDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof SharingDTO; value: string },
  ) {
    // console.log(Object.keys(SharingDTO));
    
    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una Ocupación
 * @param id Identificador la Ocupación a actualizar
 * @param body Datos de actualización la Ocupación
 * @returns Ocupación actualizado
 */

    @Roles("MONITOR")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Ocupación',
    description: 'Actualiza una Ocupación existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador la Ocupación a actualizar', type: String })
  @ApiBody({ type: SharingUpdateDTO, description: 'Datos de actualización la Ocupación' })
  @ApiOkResponse({
    description: 'Ocupación actualizado exitosamente',
    type: SharingDTO,
  })
  public async updateSharing(
    @Param('id') id: string,
    @Body() body: SharingUpdateDTO,
  ) {
    return await this.countryService.updateSharing(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una Ocupación
 * @param id Identificador la Ocupación a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("MONITOR")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Ocupación',
    description: 'Elimina una Ocupación según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador la Ocupación a eliminar', type: String })
  @ApiOkResponse({
    description: 'Ocupación eliminado exitosamente',
    type: String,
  })
  public async deleteSharing(@Param('id') id: string) {
    return await this.countryService.deleteSharing(id);
  }

}
