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
import {
  FindPermissionTypeDTO,
  PermissionTypeDTO,
  PermissionTypeUpdateDTO,
} from '../dto/permissions-types.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionTypeService } from '../services/permissions-types.service';

@ApiTags('PermissionTypes') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('permission-type')
@UseGuards(AuthGuard, RolesGuard)
export class PermissionTypeController {
  constructor(private readonly countryService: PermissionTypeService) {}

  // @PublicAccess()
  /**
   * Registrar Tipos de Permisos
   * @param body Datos de Tipos de Permisos a registrar
   * @returns Datos de Tipos de Permisos registrado
   */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Tipos de Permisos',
    description: 'Registra un nuevo Tipos de Permisos',
  })
  @ApiBody({ type: PermissionTypeDTO })
  @ApiCreatedResponse({
    description: 'Tipos de Permisos registrado exitosamente',
    type: PermissionTypeDTO,
  })
  public async registerPermissionType(@Body() body: PermissionTypeDTO) {
    return await this.countryService.createPermissionType(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todas las Tipos de Permisoses
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Tipos de Permisoses
   * @returns Lista de Tipos de Permisoses según los parámetros de consulta
   */

    @Roles("ADMIN", "TECHNICAL_ASSISTENT", "FACILITATOR", "COORDINATOR", "HUMAN_TALENT", "MANAGER", "MONITOR", "TECHNICAL_CHIEF")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las Tipos de Permisoses',
    description:
      'Obtiene una lista de todas las Tipos de Permisoses según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Permisoses obtenida exitosamente',
    type: [PermissionTypeDTO],
  })
  public async findAllPermissionType(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.countryService.findPermissionType(+page, +limit, search);
  }

  // @PublicAccess()
  /**
   * Obtener una Tipos de Permisos por su ID
   * @param id ID la Tipos de Permisos a obtener
   * @returns Tipos de Permisos correspondiente al ID proporcionado
   */

  @Roles("ADMIN", "TECHNICAL_ASSISTENT", "FACILITATOR", "COORDINATOR", "HUMAN_TALENT", "MANAGER", "MONITOR", "TECHNICAL_CHIEF")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Tipos de Permisos por su ID',
    description:
      'Obtiene la Tipos de Permisos correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID la Tipos de Permisos',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tipos de Permisos obtenido exitosamente',
    type: PermissionTypeDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Tipos de Permisos con el ID proporcionado',
  })
  public async findPermissionTypeById(@Param('id') id: string) {
    return await this.countryService.findPermissionTypeById(id);
  }

  /**
   * Buscar una Tipos de Permisos por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Tipos de Permisos que coincide con los parámetros de búsqueda
   */

  @Roles("ADMIN", "TECHNICAL_ASSISTENT", "FACILITATOR", "COORDINATOR", "HUMAN_TALENT", "MANAGER", "MONITOR", "TECHNICAL_CHIEF")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Tipos de Permisos por cualquier clave y valor',
    description:
      'Busca una Tipos de Permisos que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({
    name: 'key',
    description: 'Clave de búsqueda',
    enum: ['deviceName', 'gatewayId', 'zone', 'date', 'event', 'status'],
  })
  @ApiOkResponse({
    description: 'Tipos de Permisos encontrado exitosamente',
    type: PermissionTypeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PermissionTypeDTO; value: string },
  ) {
    return await this.countryService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una Tipos de Permisos
   * @param id Identificador la Tipos de Permisos a actualizar
   * @param body Datos de actualización la Tipos de Permisos
   * @returns Tipos de Permisos actualizado
   */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Tipos de Permisos',
    description:
      'Actualiza una Tipos de Permisos existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador la Tipos de Permisos a actualizar',
    type: String,
  })
  @ApiBody({
    type: PermissionTypeUpdateDTO,
    description: 'Datos de actualización la Tipos de Permisos',
  })
  @ApiOkResponse({
    description: 'Tipos de Permisos actualizado exitosamente',
    type: PermissionTypeDTO,
  })
  public async updatePermissionType(
    @Param('id') id: string,
    @Body() body: PermissionTypeUpdateDTO,
  ) {
    return await this.countryService.updatePermissionType(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una Tipos de Permisos
   * @param id Identificador la Tipos de Permisos a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Tipos de Permisos',
    description:
      'Elimina una Tipos de Permisos según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador la Tipos de Permisos a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tipos de Permisos eliminado exitosamente',
    type: String,
  })
  public async deletePermissionType(@Param('id') id: string) {
    return await this.countryService.deletePermissionType(id);
  }
}
