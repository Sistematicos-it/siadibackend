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
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegionService } from '../services/region.service';
import { FindRegionDTO, RegionDTO, RegionUpdateDTO } from '../dto/region.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Regions') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('region')
@UseGuards(AuthGuard, RolesGuard)
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  // @PublicAccess()
  /**
 * Registrar region
 * @param body Datos del region a registrar
 * @returns Datos del region registrado
 */
  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar region',
    description: 'Registra un nuevo region',
  })
  @ApiBody({ type: RegionDTO })
  @ApiCreatedResponse({
    description: 'Región registrado exitosamente',
    type: RegionDTO,
  })
  public async registerRegion(@Body() body: RegionDTO) {
    const { name } = body;
    const nameExists = await this.regionService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de región ya existe');
    }
    return await this.regionService.createRegion(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las regiones
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las regiones
 * @returns Lista de historiales de equipo según los parámetros de consulta
 */
  @Roles('TECHNICAL_ASSISTENT',
  'FACILITATOR',
  'HUMAN_TALENT',
  'COORDINATOR',
  'MANAGER',
  'TECHNICAL_CHIEF',
  'MONITOR',
  'ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las regiones',
    description: 'Obtiene una lista de todos los contactos de notificaciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de contactos para notificaciones obtenida exitosamente',
    type: [RegionDTO],
  })
  public async findAllRegion(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.regionService.findRegion(+page, +limit, search, req);
  }


  // @PublicAccess()
  /**
 * Obtener un region por su ID
 * @param id ID de la region a obtener
 * @returns Región correspondiente al ID proporcionado
 */
  @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un region por su ID',
    description: 'Obtiene el region correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del region', type: String })
  @ApiOkResponse({
    description: 'Región obtenida exitosamente',
    type: RegionDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró el region con el ID proporcionado' })
  public async findRegionById(@Param('id') id: string) {
    return await this.regionService.findRegionById(id);
  }


  /**
 * Buscar un region por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Región que coincide con los parámetros de búsqueda
 */
  @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un region por cualquier clave y valor',
    description: 'Busca un region que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Región encontrado exitosamente',
    type: RegionDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof RegionDTO; value: string },
  ) {
    
    return await this.regionService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar un region
 * @param id Identificador del region a actualizar
 * @param body Datos de actualización del region
 * @returns Región actualizado
 */
  @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un region',
    description: 'Actualiza un region existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del region a actualizar', type: String })
  @ApiBody({ type: RegionUpdateDTO, description: 'Datos de actualización del region' })
  @ApiOkResponse({
    description: 'Región actualizado exitosamente',
    type: RegionDTO,
  })
  public async updateRegion(
    @Param('id') id: string,
    @Body() body: RegionUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.regionService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de región ya existe');
    }
    return await this.regionService.updateRegion(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un region
 * @param id Identificador del region a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */
  @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un region',
    description: 'Elimina un region según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del region a eliminar', type: String })
  @ApiOkResponse({
    description: 'Región eliminado exitosamente',
    type: String,
  })
  public async deleteRegion(@Param('id') id: string) {
    return await this.regionService.deleteRegion(id);
  }
}
