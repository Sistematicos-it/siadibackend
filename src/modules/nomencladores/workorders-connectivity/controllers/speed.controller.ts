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
import { FindSpeedDTO, SpeedDTO, SpeedUpdateDTO } from '../dto/speed.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SpeedService } from '../services/speed.service';

@ApiTags('Speeds') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('speed')
@UseGuards(AuthGuard, RolesGuard)
export class SpeedController {
  constructor(private readonly countryService: SpeedService) {}

  // @PublicAccess()
  /**
 * Registrar Velocidad
 * @param body Datos de Velocidad a registrar
 * @returns Datos de Velocidad registrado
 */

    @Roles("MONITOR")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Velocidad',
    description: 'Registra un nuevo Velocidad',
  })
  @ApiBody({ type: SpeedDTO })
  @ApiCreatedResponse({
    description: 'Velocidad registrado exitosamente',
    type: SpeedDTO,
  })
  public async registerSpeed(@Body() body: SpeedDTO) {
    return await this.countryService.createSpeed(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todas las Velocidades
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las Velocidades
 * @returns Lista de Velocidades según los parámetros de consulta
 */

    @Roles("MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las Velocidades',
    description: 'Obtiene una lista de todas las Velocidades según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Velocidades obtenida exitosamente',
    type: [SpeedDTO],
  })
  public async findAllSpeed(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.countryService.findSpeed(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una Velocidad por su ID
 * @param id ID la Velocidad a obtener
 * @returns Velocidad correspondiente al ID proporcionado
 */

    @Roles("MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Velocidad por su ID',
    description: 'Obtiene la Velocidad correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID la Velocidad', type: String })
  @ApiOkResponse({
    description: 'Velocidad obtenido exitosamente',
    type: SpeedDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Velocidad con el ID proporcionado' })
  public async findSpeedById(@Param('id') id: string) {
    return await this.countryService.findSpeedById(id);
  }


  /**
 * Buscar una Velocidad por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Velocidad que coincide con los parámetros de búsqueda
 */

    @Roles("MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Velocidad por cualquier clave y valor',
    description: 'Busca una Velocidad que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Velocidad encontrado exitosamente',
    type: SpeedDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof SpeedDTO; value: string },
  ) {    
    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una Velocidad
 * @param id Identificador la Velocidad a actualizar
 * @param body Datos de actualización la Velocidad
 * @returns Velocidad actualizado
 */

    @Roles("MONITOR")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Velocidad',
    description: 'Actualiza una Velocidad existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador la Velocidad a actualizar', type: String })
  @ApiBody({ type: SpeedUpdateDTO, description: 'Datos de actualización la Velocidad' })
  @ApiOkResponse({
    description: 'Velocidad actualizado exitosamente',
    type: SpeedDTO,
  })
  public async updateSpeed(
    @Param('id') id: string,
    @Body() body: SpeedUpdateDTO,
  ) {
    return await this.countryService.updateSpeed(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una Velocidad
 * @param id Identificador la Velocidad a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("MONITOR")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Velocidad',
    description: 'Elimina una Velocidad según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador la Velocidad a eliminar', type: String })
  @ApiOkResponse({
    description: 'Velocidad eliminado exitosamente',
    type: String,
  })
  public async deleteSpeed(@Param('id') id: string) {
    return await this.countryService.deleteSpeed(id);
  }

}
