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
  Req,
} from '@nestjs/common';
import { AssetService } from '../services/asset.service';
import { AssetDTO, ReassignAssetsDTO, UpdateAssetDTO } from '../dto/asset.dto';

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
import { ASSET_CATEGORY } from 'src/modules/nomencladores/asset-type/interfaces/asset-type.interface';
import { Request } from 'express';

@ApiTags('Asset') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('asset')
@UseGuards(AuthGuard, RolesGuard)
export class AssetController {
  constructor(private readonly AssetService: AssetService) {}

  // @PublicAccess()
  /**
   * Registrar Asset
   * @param body Datos del bien a registrar
   * @returns Datos del bien registrado
   */

  @Roles('ADMIN', 'HUMAN_TALENT')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar bien',
    description: 'Registra un nuevo bien',
  })
  @ApiBody({ type: AssetDTO })
  @ApiCreatedResponse({
    description: 'bien registrada exitosamente',
    type: AssetDTO,
  })
  public async registerAsset(@Body() body: AssetDTO, @Req() req: Request) {
    return await this.AssetService.createAsset(body, req.idUser, req.ip);
  }

  @Roles('ADMIN', 'HUMAN_TALENT')
  @Patch('reassign-employee')
  @ApiOperation({
    summary: 'Reasignar bienes',
  })
  @ApiBody({ type: ReassignAssetsDTO })
  public async reassignAssets(@Body() body: ReassignAssetsDTO) {
    return await this.AssetService.reassignResponsibleEmployee(
      body.old_employee_id,
      body.new_employee_id,
    );
  }

  // @PublicAccess()
  /**
   * Obtener todos las Tipos de bienes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Tipos de bienes
   * @returns Lista de Tipos de bienes según los parámetros de consulta
   */

  @Roles('ADMIN', 'HUMAN_TALENT', 'FACILITATOR', "TECHNICAL_CHIEF")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Tipos de bienes',
    description:
      'Obtiene un lista de todas las Tipos de bienes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'type', enum: ASSET_CATEGORY, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de bienes obtenida exitosamente',
    type: [AssetDTO],
  })
  public async findAllAsset(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.AssetService.findAll(+page, +limit, req);
  }
  @Roles('HUMAN_TALENT')
  @Get('employee/:id/asset-delivery')
  @ApiOperation({
    summary: 'Generar acta de entrega',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: String })
  @ApiQuery({ name: 'oldProject', type: Boolean, required: false })
  @ApiQuery({ name: 'new_employee', type: String, required: false })
  @ApiQuery({ name: 'category', enum: ASSET_CATEGORY, required: false })
  @ApiQuery({ name: 'code', type: String, required: false })
  public async generateAssetDelivery(
    @Param('id') id: string,
    @Query('oldProject') oldProject: boolean,
    @Query('new_employee') new_employee: string,
    @Query('category') category: ASSET_CATEGORY,
    @Query('code') code: string,
  ) {
    return await this.AssetService.generateAssetDelivery(
      id,
      oldProject,
      category,
      new_employee,
      code
    );
  }

  // @PublicAccess()
  /**
   * Obtener un bien por su ID
   * @param id ID del bien a obtener
   * @returns bien correspondiente al ID proporcionado
   */
  @Roles('ADMIN', 'HUMAN_TALENT', 'FACILITATOR', "TECHNICAL_CHIEF")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un bien por su ID',
    description: 'Obtiene la bien correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del bien', type: String })
  @ApiOkResponse({
    description: 'bien obtenida exitosamente',
    type: AssetDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la bien con el ID proporcionado',
  })
  public async findAssetById(@Param('id') id: string) {
    return await this.AssetService.findOne(id);
  }

  /**
   * Buscar un bien por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns bien que coincide con los parámetros de búsqueda
   */
  @Roles('ADMIN', 'HUMAN_TALENT', 'FACILITATOR', "TECHNICAL_CHIEF")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un bien por cualquier clave y valor',
    description: 'Busca un bien que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'bien encontrado exitosamente',
    type: AssetDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof AssetDTO; value: string },
  ) {
    return await this.AssetService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar un bien
   * @param id Identificador del bien a actualizar
   * @param body Datos de actualización del bien
   * @returns bien actualizado
   */
  @Roles('ADMIN', 'HUMAN_TALENT')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un bien',
    description:
      'Actualiza un bien existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del bien se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del bien a actualizar',
    type: String,
  })
  @ApiBody({
    type: UpdateAssetDTO,
    description: 'Datos de actualización del bien',
  })
  @ApiOkResponse({
    description: 'bien actualizado exitosamente',
    type: AssetDTO,
  })
  public async updateAsset(
    @Param('id') id: string,
    @Body() body: UpdateAssetDTO,
    @Req() req: Request,
  ) {
    return await this.AssetService.updateAsset(id, body, req.idUser, req.ip);
  }

  // @PublicAccess()
  /**
   * Eliminar un bien
   * @param id Identificador del bien a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */
  @Roles('ADMIN', 'HUMAN_TALENT')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un bien',
    description: 'Elimina un bien según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del bien a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'bien eliminado exitosamente',
    type: String,
  })
  public async deleteAsset(@Param('id') id: string, @Req() req: Request) {
    return await this.AssetService.deleteAsset(id, req.idUser, req.ip);
  }
}
