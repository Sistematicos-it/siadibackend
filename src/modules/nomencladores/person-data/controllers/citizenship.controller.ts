import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FindCitizenshipDTO, CitizenshipDTO, CitizenshipUpdateDTO } from '../dto/citizenship.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CitizenshipService } from '../services/citizenship.service';

@ApiTags('Citizenships') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('citizenships')
@UseGuards(AuthGuard, RolesGuard)
export class CitizenshipController {
  constructor(private readonly citizenshipsService: CitizenshipService) {}

  // @PublicAccess()
  /**
 * Registrar nacionalidad
 * @param body Datos del nacionalidad a registrar
 * @returns Datos del nacionalidad registrado
 */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nacionalidad',
    description: 'Registra un nuevo nacionalidad',
  })
  @ApiBody({ type: CitizenshipDTO })
  @ApiCreatedResponse({
    description: 'Notificación registrado exitosamente',
    type: CitizenshipDTO,
  })
  public async registerCitizenship(@Body() body: CitizenshipDTO) {
    const { name } = body;
    const nameExists = await this.citizenshipsService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de nacionalidad ya existe');
    }
    return await this.citizenshipsService.createCitizenship(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos los nacionalidades 
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar los nacionalidades 
 * @returns Lista de nacionalidades  según los parámetros de consulta
 */

    @Roles("ADMIN", "FACILITATOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los nacionalidades',
    description: 'Obtiene una lista de todos los nacionalidades según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de nacionalidades  obtenida exitosamente',
    type: [CitizenshipDTO],
  })
  public async findAllCitizenship(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.citizenshipsService.findCitizenship(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener un nacionalidad por su ID
 * @param id ID del nacionalidad a obtener
 * @returns Notificación correspondiente al ID proporcionado
 */

    @Roles("ADMIN", "FACILITATOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un nacionalidad por su ID',
    description: 'Obtiene el nacionalidad correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del nacionalidad', type: String })
  @ApiOkResponse({
    description: 'Notificación obtenido exitosamente',
    type: CitizenshipDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró el nacionalidad con el ID proporcionado' })
  public async findCitizenshipById(@Param('id') id: string) {
    return await this.citizenshipsService.findCitizenshipById(id);
  }


  /**
 * Buscar un nacionalidad por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Notificación que coincide con los parámetros de búsqueda
 */

    @Roles("ADMIN", "FACILITATOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un nacionalidad por cualquier clave y valor',
    description: 'Busca un nacionalidad que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Notificación encontrado exitosamente',
    type: CitizenshipDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CitizenshipDTO; value: string },
  ) {
    // console.log(Object.keys(CitizenshipDTO));
    
    return await this.citizenshipsService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar un nacionalidad
 * @param id Identificador del nacionalidad a actualizar
 * @param body Datos de actualización del nacionalidad
 * @returns Notificación actualizado
 */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un nacionalidad',
    description: 'Actualiza un nacionalidad existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del nacionalidad a actualizar', type: String })
  @ApiBody({ type: CitizenshipUpdateDTO, description: 'Datos de actualización del nacionalidad' })
  @ApiOkResponse({
    description: 'Notificación actualizado exitosamente',
    type: CitizenshipDTO,
  })
  public async updateCitizenship(
    @Param('id') id: string,
    @Body() body: CitizenshipUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.citizenshipsService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de nacionalidad ya existe');
    }
    return await this.citizenshipsService.updateCitizenship(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un nacionalidad
 * @param id Identificador del nacionalidad a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un nacionalidad',
    description: 'Elimina un nacionalidad según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del nacionalidad a eliminar', type: String })
  @ApiOkResponse({
    description: 'Notificación eliminado exitosamente',
    type: String,
  })
  public async deleteCitizenship(@Param('id') id: string) {
    return await this.citizenshipsService.deleteCitizenship(id);
  }

}
