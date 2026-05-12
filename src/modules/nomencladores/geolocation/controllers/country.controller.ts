import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CountryService } from '../services/country.service';
import { FindCountryDTO, CountryDTO, CountryUpdateDTO } from '../dto/country.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Countrys') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('country')
// @UseGuards(AuthGuard, RolesGuard)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  // @PublicAccess()
  /**
 * Registrar notificación
 * @param body Datos del notificación a registrar
 * @returns Datos del notificación registrado
 */
  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar notificación',
    description: 'Registra un nuevo notificación',
  })
  @ApiBody({ type: CountryDTO })
  @ApiCreatedResponse({
    description: 'Notificación registrado exitosamente',
    type: CountryDTO,
  })
  public async registerCountry(@Body() body: CountryDTO) {
    const { name } = body;
    const nameExists = await this.countryService.checkIfNameExists(name);

    if (nameExists) {
      throw new BadRequestException('Ese nombre de país ya existe');
    }
    return await this.countryService.createCountry(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos los historiales de equipo
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar los historiales de equipo
 * @returns Lista de historiales de equipo según los parámetros de consulta
 */
  @Roles("ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los historiales de equipo',
    description: 'Obtiene una lista de todos los historiales de equipo según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de historiales de equipo obtenida exitosamente',
    type: [CountryDTO],
  })
  public async findAllCountry(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.countryService.findCountry(+page, +limit, search, req);
  }


  // @PublicAccess()
  /**
 * Obtener un notificación por su ID
 * @param id ID del notificación a obtener
 * @returns Notificación correspondiente al ID proporcionado
 */
  @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un notificación por su ID',
    description: 'Obtiene el notificación correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del notificación', type: String })
  @ApiOkResponse({
    description: 'Notificación obtenido exitosamente',
    type: CountryDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró el notificación con el ID proporcionado' })
  public async findCountryById(@Param('id') id: string) {
    return await this.countryService.findCountryById(id);
  }


  /**
 * Buscar un notificación por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Notificación que coincide con los parámetros de búsqueda
 */
  @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un notificación por cualquier clave y valor',
    description: 'Busca un notificación que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Notificación encontrado exitosamente',
    type: CountryDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CountryDTO; value: string },
  ) {
    // console.log(Object.keys(CountryDTO));
    
    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar un notificación
 * @param id Identificador del notificación a actualizar
 * @param body Datos de actualización del notificación
 * @returns Notificación actualizado
 */
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un notificación',
    description: 'Actualiza un notificación existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del notificación a actualizar', type: String })
  @ApiBody({ type: CountryUpdateDTO, description: 'Datos de actualización del notificación' })
  @ApiOkResponse({
    description: 'Notificación actualizado exitosamente',
    type: CountryDTO,
  })
  public async updateCountry(
    @Param('id') id: string,
    @Body() body: CountryUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.countryService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de país ya existe');
    }
    return await this.countryService.updateCountry(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un notificación
 * @param id Identificador del notificación a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un notificación',
    description: 'Elimina un notificación según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del notificación a eliminar', type: String })
  @ApiOkResponse({
    description: 'Notificación eliminado exitosamente',
    type: String,
  })
  public async deleteCountry(@Param('id') id: string) {
    return await this.countryService.deleteCountry(id);
  }

}
