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
import { FindActivitieDTO, ActivitieDTO, ActivitieUpdateDTO } from '../dto/activitie.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ActivitieService } from '../services/activitie.service';

@ApiTags('Activities') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('activitie')
@UseGuards(AuthGuard, RolesGuard)
export class ActivitieController {
  constructor(private readonly countryService: ActivitieService) {}

  // @PublicAccess()
  /**
 * Registrar Ocupación
 * @param body Datos dla Ocupación a registrar
 * @returns Datos dla Ocupación registrado
 */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Ocupación',
    description: 'Registra un nuevo Ocupación',
  })
  @ApiBody({ type: ActivitieDTO })
  @ApiCreatedResponse({
    description: 'Ocupación registrado exitosamente',
    type: ActivitieDTO,
  })
  public async registerActivitie(@Body() body: ActivitieDTO) {
    return await this.countryService.createActivitie(body);
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

    @Roles("ADMIN")
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
    type: [ActivitieDTO],
  })
  public async findAllActivitie(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.countryService.findActivitie(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una Ocupación por su ID
 * @param id ID dla Ocupación a obtener
 * @returns Ocupación correspondiente al ID proporcionado
 */

    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Ocupación por su ID',
    description: 'Obtiene la Ocupación correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID dla Ocupación', type: String })
  @ApiOkResponse({
    description: 'Ocupación obtenido exitosamente',
    type: ActivitieDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Ocupación con el ID proporcionado' })
  public async findActivitieById(@Param('id') id: string) {
    return await this.countryService.findActivitieById(id);
  }


  /**
 * Buscar una Ocupación por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Ocupación que coincide con los parámetros de búsqueda
 */

    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Ocupación por cualquier clave y valor',
    description: 'Busca una Ocupación que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Ocupación encontrado exitosamente',
    type: ActivitieDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ActivitieDTO; value: string },
  ) {
    // console.log(Object.keys(ActivitieDTO));
    
    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una Ocupación
 * @param id Identificador dla Ocupación a actualizar
 * @param body Datos de actualización dla Ocupación
 * @returns Ocupación actualizado
 */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Ocupación',
    description: 'Actualiza una Ocupación existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador dla Ocupación a actualizar', type: String })
  @ApiBody({ type: ActivitieUpdateDTO, description: 'Datos de actualización dla Ocupación' })
  @ApiOkResponse({
    description: 'Ocupación actualizado exitosamente',
    type: ActivitieDTO,
  })
  public async updateActivitie(
    @Param('id') id: string,
    @Body() body: ActivitieUpdateDTO,
  ) {
    return await this.countryService.updateActivitie(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una Ocupación
 * @param id Identificador dla Ocupación a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Ocupación',
    description: 'Elimina una Ocupación según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador dla Ocupación a eliminar', type: String })
  @ApiOkResponse({
    description: 'Ocupación eliminado exitosamente',
    type: String,
  })
  public async deleteActivitie(@Param('id') id: string) {
    return await this.countryService.deleteActivitie(id);
  }

}
