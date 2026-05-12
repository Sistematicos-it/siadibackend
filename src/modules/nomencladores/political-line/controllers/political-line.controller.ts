import {
  Body,
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
import { PoliticalLineService } from '../services/political-line.service';
import { FindPoliticalLineDTO, PoliticalLineDTO, PoliticalLineUpdateDTO } from '../dto/political-line.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('PoliticalLine') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('political-line')
@UseGuards(AuthGuard, RolesGuard)
export class PoliticalLineController {
  constructor(private readonly PoliticalLineService: PoliticalLineService) {}

  // @PublicAccess()
  /**
 * Registrar PoliticalLine
 * @param body Datos de la Linea Politica a registrar
 * @returns Datos de la Linea Politica registrado
 */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Linea Politica',
    description: 'Registra una nueva Linea Politica',
  })
  @ApiBody({ type: PoliticalLineDTO })
  @ApiCreatedResponse({
    description: 'Linea Politica registrada exitosamente',
    type: PoliticalLineDTO,
  })
  public async registerPoliticalLine(@Body() body: PoliticalLineDTO) {
    return await this.PoliticalLineService.createPoliticalLine(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las Linea Politicas
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las Linea Politicas
 * @returns Lista de Linea Politicas según los parámetros de consulta
 */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Linea Politicas',
    description: 'Obtiene una lista de todas las Linea Politicas según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Linea Politicaes obtenida exitosamente',
    type: [PoliticalLineDTO],
  })
  public async findAllPoliticalLine(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.PoliticalLineService.findPoliticalLine(+page, +limit, search, req);
  }


  // @PublicAccess()
  /**
 * Obtener una Linea Politica por su ID
 * @param id ID de la Linea Politica a obtener
 * @returns Linea Politica correspondiente al ID proporcionado
 */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Linea Politica por su ID',
    description: 'Obtiene la Linea Politica correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Linea Politica', type: String })
  @ApiOkResponse({
    description: 'Linea Politica obtenida exitosamente',
    type: PoliticalLineDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Linea Politica con el ID proporcionado' })
  public async findPoliticalLineById(@Param('id') id: string) {
    return await this.PoliticalLineService.findPoliticalLineById(id);
  }


  /**
 * Buscar un Linea Politica por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Linea Politica que coincide con los parámetros de búsqueda
 */

    @Roles("HUMAN_TALENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Linea Politica por cualquier clave y valor',
    description: 'Busca una Linea Politica que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Linea Politica encontrado exitosamente',
    type: PoliticalLineDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PoliticalLineDTO; value: string },
  ) {
    
    return await this.PoliticalLineService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una Linea Politica
 * @param id Identificador de la Linea Politica a actualizar
 * @param body Datos de actualización de la Linea Politica
 * @returns Linea Politica actualizado
 */

    @Roles("HUMAN_TALENT")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Linea Politica',
    description: 'Actualiza una Linea Politica existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Linea Politica a actualizar', type: String })
  @ApiBody({ type: PoliticalLineUpdateDTO, description: 'Datos de actualización de la Linea Politica' })
  @ApiOkResponse({
    description: 'Linea Politica actualizada exitosamente',
    type: PoliticalLineDTO,
  })
  public async updatePoliticalLine(
    @Param('id') id: string,
    @Body() body: PoliticalLineUpdateDTO,
  ) {
    return await this.PoliticalLineService.updatePoliticalLine(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una Linea Politica
 * @param id Identificador de la Linea Politica a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("HUMAN_TALENT")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Linea Politica',
    description: 'Elimina una Linea Politica según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Linea Politica a eliminar', type: String })
  @ApiOkResponse({
    description: 'Linea Politica eliminado exitosamente',
    type: String,
  })
  public async deletePoliticalLine(@Param('id') id: string) {
    return await this.PoliticalLineService.deletePoliticalLine(id);
  }
}
