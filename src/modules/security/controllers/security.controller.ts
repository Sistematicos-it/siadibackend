import { Controller, Get, Param,Req, Query, UseGuards } from '@nestjs/common';
import { SecurityService } from '../services/security.service';
import { SecurityDTO } from '../dto/security.dto';

import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators';
import { SECURITY_ACTION } from '../interfaces/security.interface';
import { Request } from 'express';

@ApiTags('Security') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('security')
@UseGuards(AuthGuard, RolesGuard)

@UseGuards(AuthGuard, RolesGuard)
export class SecurityController {
  constructor(private readonly SecurityService: SecurityService) {}

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los registros de seguridad
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar los registros de seguridad
   * @returns Lista de registros de seguridad según los parámetros de consulta
   */

    @Roles("ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los registros de seguridad',
    description:
      'Obtiene una lista de todas los registros de seguridad según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de registro de seguridades obtenida exitosamente',
    type: [SecurityDTO],
  })
  public async findAllSecurity(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request
  ) {
    return await this.SecurityService.findSecurity(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener un registro de seguridad por su ID
   * @param id ID del registro de seguridad a obtener
   * @returns registro de seguridad correspondiente al ID proporcionado
   */

    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un registro de seguridad por su ID',
    description:
      'Obtiene el registro de seguridad correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de seguridad',
    type: String,
  })
  @ApiOkResponse({
    description: 'registro de seguridad obtenida exitosamente',
    type: SecurityDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró el registro de seguridad con el ID proporcionado',
  })
  public async findSecurityById(@Param('id') id: string) {
    return await this.SecurityService.findSecurityById(id);
  }

  /**
   * Buscar un registro de seguridad por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns registro de seguridad que coincide con los parámetros de búsqueda
   */

    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un registro de seguridad por cualquier clave y valor',
    description:
      'Busca un registro de seguridad que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'registro de seguridad encontrado exitosamente',
    type: SecurityDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof SecurityDTO; value: string },
  ) {
    return await this.SecurityService.findBy({
      key: params.key,
      value: params.value,
    });
  }

    /**
   * Obtener un registro de seguridad por su ID
   * @param id ID del registro de seguridad a obtener
   * @returns registro de seguridad correspondiente al ID proporcionado
   */

  @Roles("ADMIN")
  @Get('trace/:entity/:id')
  @ApiOperation({
    summary: 'Obtiene los registros de seguridad por el ID de su entidad relacionada',
    description:
      'Obtiene los registros de seguridad por el ID de su entidad relacionadao',
  })
  @ApiParam({ name: 'entity', description: 'entidad', type: String })
  @ApiParam({ name: 'id', description: 'Id entidad', type: String })
  @ApiOkResponse({ description: 'registro de seguridad obtenida exitosamente', type: SecurityDTO, })
  @ApiNotFoundResponse({description: 'No se encontró el registros con el ID proporcionado',})
  public async findSecurityByEntityNameAndId(@Param('entity') entity: string, @Param('id') id: string) {
    return await this.SecurityService.findSecurityByEntityNameAndId(entity,id);
  }
}
