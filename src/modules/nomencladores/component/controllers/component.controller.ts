import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComponentService } from '../services/component.service';
import {
  FindComponentDTO,
  ComponentDTO,
  ComponentUpdateDTO,
} from '../dto/component.dto';

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
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('Component') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('component')
@UseGuards(AuthGuard, RolesGuard)
export class ComponentController {
  constructor(private readonly ComponentService: ComponentService) {}

  // @PublicAccess()
  /**
   * Registrar Component
   * @param body Datos del componente a registrar
   * @returns Datos del componente registrado
   */

  @Roles('TECHNICAL_CHIEF')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Componente',
    description: 'Registra una nueva Componente',
  })
  @ApiBody({ type: ComponentDTO })
  @ApiCreatedResponse({
    description: 'Componente registrado exitosamente',
    type: ComponentDTO,
  })
  public async registerComponent(@Body() body: ComponentDTO) {
    return await this.ComponentService.createComponent(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las componentes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las componentes
   * @returns Lista de componentes según los parámetros de consulta
   */
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los Componentes',
    description:
      'Obtiene una lista de todas los Componentes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Componentes obtenida exitosamente',
    type: [ComponentDTO],
  })
  public async findAllComponent(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.ComponentService.findComponent(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una componente por su ID
   * @param id ID de el componente a obtener
   * @returns componente correspondiente al ID proporcionado
   */
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Componente por su ID',
    description: 'Obtiene la Componente correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Componente', type: String })
  @ApiOkResponse({
    description: 'Componente obtenida exitosamente',
    type: ComponentDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Componente con el ID proporcionado',
  })
  public async findComponentById(@Param('id') id: string) {
    return await this.ComponentService.findComponentById(id);
  }

  /**
   * Buscar un componente por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns componente que coincide con los parámetros de búsqueda
   */

  @Roles("TECHNICAL_CHIEF", "TECHNICAL_ASSISTENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Componente por cualquier clave y valor',
    description:
      'Busca una Componente que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Componente encontrado exitosamente',
    type: ComponentDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ComponentDTO; value: string },
  ) {
    return await this.ComponentService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una componente
   * @param id Identificador de el componente a actualizar
   * @param body Datos de actualización de el componente
   * @returns componente actualizado
   */

  @Roles('TECHNICAL_CHIEF')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Componente',
    description:
      'Actualiza una Componente existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Componente a actualizar',
    type: String,
  })
  @ApiBody({
    type: ComponentUpdateDTO,
    description: 'Datos de actualización de la Componente',
  })
  @ApiOkResponse({
    description: 'Componente actualizada exitosamente',
    type: ComponentDTO,
  })
  public async updateComponent(
    @Param('id') id: string,
    @Body() body: ComponentUpdateDTO,
  ) {
    return await this.ComponentService.updateComponent(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una componente
   * @param id Identificador de el componente a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('TECHNICAL_CHIEF')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Componente',
    description: 'Elimina una Componente según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Componente a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Componente eliminado exitosamente',
    type: String,
  })
  public async deleteComponent(@Param('id') id: string) {
    return await this.ComponentService.deleteComponent(id);
  }
}
