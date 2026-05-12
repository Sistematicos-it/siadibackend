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
import { CantonService } from '../services/canton.service';
import { FindCantonDTO, CantonDTO, CantonUpdateDTO } from '../dto/canton.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Cantones') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('canton')
@UseGuards(AuthGuard, RolesGuard)


export class CantonController {
  constructor(private readonly cantonService: CantonService) {}

  // @PublicAccess()
  /**
 * Registrar canton
 * @param body Datos del canton a registrar
 * @returns Datos del canton registrado
 */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar canton',
    description: 'Registra un nuevo canton',
  })
  @ApiBody({ type: CantonDTO })
  @ApiCreatedResponse({
    description: 'Región registrado exitosamente',
    type: CantonDTO,
  })
  public async registerCanton(@Body() body: CantonDTO) {
    const name = body.name;
    const provincia = body.province;
    const nameExists = await this.cantonService.checkIfCantonExists(name, provincia);

    if (nameExists) {
      throw new ConflictException('Cantón ya existe para la provincia escogida');
    }
    return await this.cantonService.createCanton(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las cantons
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las cantons
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
    summary: 'Obtener todos las cantons',
    description: 'Obtiene una lista de todos los contactos de notificaciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de contactos para notificaciones obtenida exitosamente',
    type: [CantonDTO],
  })
  public async findAllCanton(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('province_id') province_id: string,
    @Req() req: Request
  ) {
    return await this.cantonService.findCanton(+page, +limit, search, province_id, req);
  }


  // @PublicAccess()
  /**
 * Obtener un canton por su ID
 * @param id ID de la canton a obtener
 * @returns Región correspondiente al ID proporcionado
 */

    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un canton por su ID',
    description: 'Obtiene el canton correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del canton', type: String })
  @ApiOkResponse({
    description: 'Región obtenida exitosamente',
    type: CantonDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró el canton con el ID proporcionado' })
  public async findCantonById(@Param('id') id: string) {
    return await this.cantonService.findCantonById(id);
  }


  /**
 * Buscar un canton por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Región que coincide con los parámetros de búsqueda
 */

    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un canton por cualquier clave y valor',
    description: 'Busca un canton que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Región encontrado exitosamente',
    type: CantonDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CantonDTO; value: string },
  ) {
    
    return await this.cantonService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar un canton
 * @param id Identificador del canton a actualizar
 * @param body Datos de actualización del canton
 * @returns Región actualizado
 */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un canton',
    description: 'Actualiza un canton existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del canton a actualizar', type: String })
  @ApiBody({ type: CantonUpdateDTO, description: 'Datos de actualización del canton' })
  @ApiOkResponse({
    description: 'Región actualizado exitosamente',
    type: CantonDTO,
  })
  public async updateCanton(
    @Param('id') id: string,
    @Body() body: CantonUpdateDTO,
  ) {
    const name = body.name;
    const province = body.province;
    const nameExists = await this.cantonService.checkIfCantonExists(name, province, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de cantón ya existe');
    }
    return await this.cantonService.updateCanton(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un canton
 * @param id Identificador del canton a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un canton',
    description: 'Elimina un canton según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del canton a eliminar', type: String })
  @ApiOkResponse({
    description: 'Región eliminado exitosamente',
    type: String,
  })
  public async deleteCanton(@Param('id') id: string) {
    return await this.cantonService.deleteCanton(id);
  }
}
