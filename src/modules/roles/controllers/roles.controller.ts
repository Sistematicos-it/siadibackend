import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RolesService } from '../services/roles.service';

import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RoleDTO } from '../dto/role.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

    @Roles("HUMAN_TALENT", "ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Buscar todos los roles',
    description: 'Busca y devuelve todos los roles en el sistema',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Número de página para la paginación de resultados',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description:
      'Límite de usuarios por página para la paginación de resultados',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Término de búsqueda para filtrar los role',
  })
  @ApiOkResponse({
    description: 'Lista de roles encontrados',
    type: RoleDTO,
    isArray: true,
  })
  public async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.rolesService.findAll(+page, +limit, search);
  }

    @Roles("HUMAN_TALENT", "ADMIN")
  @Get(':id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol a buscar' })
  @ApiOkResponse({ description: 'Rol encontrado', type: RoleDTO })
  @ApiNotFoundResponse({
    description: 'No se encontró ningún rol con el ID especificado',
  })
  public async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }
}
