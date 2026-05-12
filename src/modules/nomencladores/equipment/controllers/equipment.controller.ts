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
import { EquipmentService } from '../services/equipment.service';
import { FindEquipmentDTO, EquipmentDTO, EquipmentUpdateDTO } from '../dto/equipment.dto';

import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('Equipment') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('equipment')
@UseGuards(AuthGuard, RolesGuard)
export class EquipmentController {
  constructor(private readonly EquipmentService: EquipmentService) {}

  // @PublicAccess()
  /**
 * Registrar Equipment
 * @param body Datos de el equipo a registrar
 * @returns Datos de el equipo registrado
 */

    @Roles("TECHNICAL_CHIEF")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Equipo',
    description: 'Registra una nueva Equipo',
  })
  @ApiBody({ type: EquipmentDTO })
  @ApiCreatedResponse({
    description: 'Equipo registrado exitosamente',
    type: EquipmentDTO,
  })
  public async registerEquipment(@Body() body: EquipmentDTO) {
    return await this.EquipmentService.createEquipment(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las equipos
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las equipos
 * @returns Lista de equipos según los parámetros de consulta
 */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Equipos',
    description: 'Obtiene una lista de todas las Equipos según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Equipos obtenida exitosamente',
    type: [EquipmentDTO],
  })
  public async findAllEquipment(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.EquipmentService.findEquipment(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una equipo por su ID
 * @param id ID de el equipo a obtener
 * @returns equipo correspondiente al ID proporcionado
 */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Equipo por su ID',
    description: 'Obtiene la Equipo correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Equipo', type: String })
  @ApiOkResponse({
    description: 'Equipo obtenida exitosamente',
    type: EquipmentDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Equipo con el ID proporcionado' })
  public async findEquipmentById(@Param('id') id: string) {
    return await this.EquipmentService.findEquipmentById(id);
  }


  /**
 * Buscar un equipo por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns equipo que coincide con los parámetros de búsqueda
 */

  @Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Equipo por cualquier clave y valor',
    description: 'Busca una Equipo que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Equipo encontrado exitosamente',
    type: EquipmentDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof EquipmentDTO; value: string },
  ) {
    
    return await this.EquipmentService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una equipo
 * @param id Identificador de el equipo a actualizar
 * @param body Datos de actualización de el equipo
 * @returns equipo actualizado
 */

    @Roles("TECHNICAL_CHIEF")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Equipo',
    description: 'Actualiza una Equipo existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Equipo a actualizar', type: String })
  @ApiBody({ type: EquipmentUpdateDTO, description: 'Datos de actualización de la Equipo' })
  @ApiOkResponse({
    description: 'Equipo actualizada exitosamente',
    type: EquipmentDTO,
  })
  public async updateEquipment(
    @Param('id') id: string,
    @Body() body: EquipmentUpdateDTO,
  ) {
    return await this.EquipmentService.updateEquipment(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una equipo
 * @param id Identificador de el equipo a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("TECHNICAL_CHIEF")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Equipo',
    description: 'Elimina una Equipo según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Equipo a eliminar', type: String })
  @ApiOkResponse({
    description: 'Equipo eliminado exitosamente',
    type: String,
  })
  public async deleteEquipment(@Param('id') id: string) {
    return await this.EquipmentService.deleteEquipment(id);
  }
}
