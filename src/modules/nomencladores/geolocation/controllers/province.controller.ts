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
import { ProvinceService } from '../services/province.service';
import { FindProvinceDTO, ProvinceDTO, ProvinceUpdateDTO } from '../dto/province.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Provinces') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('province')
@UseGuards(AuthGuard, RolesGuard)
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  // @PublicAccess()
  /**
 * Registrar province
 * @param body Datos del province a registrar
 * @returns Datos del province registrado
 */
  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar province',
    description: 'Registra un nuevo province',
  })
  @ApiBody({ type: ProvinceDTO })
  @ApiCreatedResponse({
    description: 'Región registrado exitosamente',
    type: ProvinceDTO,
  })
  public async registerProvince(@Body() body: ProvinceDTO) {
    const { name } = body;
    const nameExists = await this.provinceService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de provincia ya existe');
    }
    return await this.provinceService.createProvince(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las provinces
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las provinces
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
    summary: 'Obtener todos las provinces',
    description: 'Obtiene una lista de todos los contactos de notificaciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de contactos para notificaciones obtenida exitosamente',
    type: [ProvinceDTO],
  })
  public async findAllProvince(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.provinceService.findProvince(+page, +limit, search, req);
  }


  // @PublicAccess()
  /**
 * Obtener un province por su ID
 * @param id ID de la province a obtener
 * @returns Región correspondiente al ID proporcionado
 */
  @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un province por su ID',
    description: 'Obtiene el province correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del province', type: String })
  @ApiOkResponse({
    description: 'Región obtenida exitosamente',
    type: ProvinceDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró el province con el ID proporcionado' })
  public async findProvinceById(@Param('id') id: string) {
    return await this.provinceService.findProvinceById(id);
  }


  /**
 * Buscar un province por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Región que coincide con los parámetros de búsqueda
 */
  @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un province por cualquier clave y valor',
    description: 'Busca un province que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'] })
  @ApiOkResponse({
    description: 'Región encontrado exitosamente',
    type: ProvinceDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ProvinceDTO; value: string },
  ) {
    
    return await this.provinceService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar un province
 * @param id Identificador del province a actualizar
 * @param body Datos de actualización del province
 * @returns Región actualizado
 */
  @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un province',
    description: 'Actualiza un province existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador del province a actualizar', type: String })
  @ApiBody({ type: ProvinceUpdateDTO, description: 'Datos de actualización del province' })
  @ApiOkResponse({
    description: 'Región actualizado exitosamente',
    type: ProvinceDTO,
  })
  public async updateProvince(
    @Param('id') id: string,
    @Body() body: ProvinceUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.provinceService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de provincia ya existe');
    }
    return await this.provinceService.updateProvince(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar un province
 * @param id Identificador del province a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */
  @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un province',
    description: 'Elimina un province según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador del province a eliminar', type: String })
  @ApiOkResponse({
    description: 'Región eliminado exitosamente',
    type: String,
  })
  public async deleteProvince(@Param('id') id: string) {
    return await this.provinceService.deleteProvince(id);
  }
}
