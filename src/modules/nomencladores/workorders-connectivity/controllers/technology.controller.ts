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
import { FindTechnologyDTO, TechnologyDTO, TechnologyUpdateDTO } from '../dto/technology.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TechnologyService } from '../services/technology.service';

@ApiTags('Technologys') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('technologys')
@UseGuards(AuthGuard, RolesGuard)
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  // @PublicAccess()
  /**
 * Registrar tecnologia
 * @param body Datos dla tecnologia a registrar
 * @returns Datos dla tecnologia registrado
 */

    @Roles("MONITOR")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar tecnologia',
    description: 'Registra un nuevo tecnologia',
  })
  @ApiBody({ type: TechnologyDTO })
  @ApiCreatedResponse({
    description: 'Notificación registrado exitosamente',
    type: TechnologyDTO,
  })
  public async registerTechnology(@Body() body: TechnologyDTO) {
    return await this.technologyService.createTechnology(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos los tecnologias 
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar los tecnologias 
 * @returns Lista de tecnologias  según los parámetros de consulta
 */

    @Roles("MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los tecnologias',
    description: 'Obtiene una lista de todos los tecnologias según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de tecnologias  obtenida exitosamente',
    type: [TechnologyDTO],
  })
  public async findAllTechnology(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.technologyService.findTechnology(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una tecnologia por su ID
 * @param id ID dla tecnologia a obtener
 * @returns Notificación correspondiente al ID proporcionado
 */

    @Roles("MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tecnologia por su ID',
    description: 'Obtiene la tecnologia correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID dla tecnologia', type: String })
  @ApiOkResponse({
    description: 'Notificación obtenido exitosamente',
    type: TechnologyDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la tecnologia con el ID proporcionado' })
  public async findTechnologyById(@Param('id') id: string) {
    return await this.technologyService.findTechnologyById(id);
  }


  /**
 * Buscar una tecnologia por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Notificación que coincide con los parámetros de búsqueda
 */

    @Roles("MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una tecnologia por cualquier clave y valor',
    description: 'Busca una tecnologia que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Notificación encontrado exitosamente',
    type: TechnologyDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof TechnologyDTO; value: string },
  ) {
    // console.log(Object.keys(TechnologyDTO));
    
    return await this.technologyService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una tecnologia
 * @param id Identificador dla tecnologia a actualizar
 * @param body Datos de actualización dla tecnologia
 * @returns Notificación actualizado
 */

    @Roles("MONITOR")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una tecnologia',
    description: 'Actualiza una tecnologia existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador dla tecnologia a actualizar', type: String })
  @ApiBody({ type: TechnologyUpdateDTO, description: 'Datos de actualización dla tecnologia' })
  @ApiOkResponse({
    description: 'Notificación actualizado exitosamente',
    type: TechnologyDTO,
  })
  public async updateTechnology(
    @Param('id') id: string,
    @Body() body: TechnologyUpdateDTO,
  ) {
    return await this.technologyService.updateTechnology(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una tecnologia
 * @param id Identificador dla tecnologia a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("MONITOR")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una tecnologia',
    description: 'Elimina una tecnologia según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador dla tecnologia a eliminar', type: String })
  @ApiOkResponse({
    description: 'Notificación eliminado exitosamente',
    type: String,
  })
  public async deleteTechnology(@Param('id') id: string) {
    return await this.technologyService.deleteTechnology(id);
  }

}
