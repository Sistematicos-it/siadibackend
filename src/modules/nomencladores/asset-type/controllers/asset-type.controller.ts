import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetTypeService } from '../services/asset-type.service';
import {
  FindAssetTypeDTO,
  AssetTypeDTO,
  AssetTypeUpdateDTO,
} from '../dto/asset-type.dto';
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
import { Request } from 'express';

@ApiTags('AssetType') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('asset_type')
export class AssetTypeController {
  constructor(private readonly AssetTypeService: AssetTypeService) {}

  // @PublicAccess()
  /**
   * Registrar AssetType
   * @param body Datos de la Tipo de bien a registrar
   * @returns Datos de la Tipo de bien registrado
   */

  @Roles('HUMAN_TALENT')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Tipo de bien',
    description: 'Registra una nueva Tipo de bien',
  })
  @ApiBody({ type: AssetTypeDTO })
  @ApiCreatedResponse({
    description: 'Tipo de bien registrada exitosamente',
    type: AssetTypeDTO,
  })
  public async registerAssetType(@Body() body: AssetTypeDTO,  @Req() req: Request) {
    console.log(body);
    return await this.AssetTypeService.createAssetType(body, req.idUser);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las Tipos de bienes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Tipos de bienes
   * @returns Lista de Tipos de bienes según los parámetros de consulta
   */

  @Roles('HUMAN_TALENT')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Tipos de bienes',
    description:
      'Obtiene una lista de todas las Tipos de bienes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de bienes obtenida exitosamente',
    type: [AssetTypeDTO],
  })
  public async findAllAssetType(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.AssetTypeService.findAssetType(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una Tipo de bien por su ID
   * @param id ID de la Tipo de bien a obtener
   * @returns Tipo de bien correspondiente al ID proporcionado
   */

  @Roles('HUMAN_TALENT')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Tipo de bien por su ID',
    description: 'Obtiene la Tipo de bien correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Tipo de bien', type: String })
  @ApiOkResponse({
    description: 'Tipo de bien obtenida exitosamente',
    type: AssetTypeDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Tipo de bien con el ID proporcionado',
  })
  public async findAssetTypeById(@Param('id') id: string) {
    return await this.AssetTypeService.findAssetTypeById(id);
  }

  /**
   * Buscar un Tipo de bien por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Tipo de bien que coincide con los parámetros de búsqueda
   */

  @Roles('HUMAN_TALENT')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Tipo de bien por cualquier clave y valor',
    description:
      'Busca una Tipo de bien que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Tipo de bien encontrado exitosamente',
    type: AssetTypeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof AssetTypeDTO; value: string },
  ) {
    return await this.AssetTypeService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una Tipo de bien
   * @param id Identificador de la Tipo de bien a actualizar
   * @param body Datos de actualización de la Tipo de bien
   * @returns Tipo de bien actualizado
   */

  @Roles('HUMAN_TALENT')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Tipo de bien',
    description:
      'Actualiza una Tipo de bien existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del tipo de bien se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Tipo de bien a actualizar',
    type: String,
  })
  @ApiBody({
    type: AssetTypeUpdateDTO,
    description: 'Datos de actualización de la Tipo de bien',
  })
  @ApiOkResponse({
    description: 'Tipo de bien actualizado exitosamente',
    type: AssetTypeDTO,
  })
  public async updateAssetType(
    @Param('id') id: string,
    @Body() body: AssetTypeUpdateDTO,
  ) {
    return await this.AssetTypeService.updateAssetType(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una Tipo de bien
   * @param id Identificador de la Tipo de bien a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('HUMAN_TALENT')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Tipo de bien',
    description:
      'Elimina una Tipo de bien según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Tipo de bien a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tipo de bien eliminado exitosamente',
    type: String,
  })
  public async deleteAssetType(@Param('id') id: string) {
    return await this.AssetTypeService.deleteAssetType(id);
  }
}
