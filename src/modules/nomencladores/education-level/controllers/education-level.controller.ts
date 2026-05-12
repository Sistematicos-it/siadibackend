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
import { EducationLevelService } from '../services/education-level.service';
import { FindEducationLevelDTO, EducationLevelDTO, EducationLevelUpdateDTO } from '../dto/education-level.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('EducationLevel') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('educationLevel')
@UseGuards(AuthGuard, RolesGuard)
export class EducationLevelController {
  constructor(private readonly EducationLevelService: EducationLevelService) {}

  // @PublicAccess()
  /**
 * Registrar EducationLevel
 * @param body Datos de la dirección a registrar
 * @returns Datos de la dirección registrado
 */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Nivel de Educacion',
    description: 'Registra un nuevo Nivel de Educacion',
  })
  @ApiBody({ type: EducationLevelDTO })
  @ApiCreatedResponse({
    description: 'Nivel de Educacion registrada exitosamente',
    type: EducationLevelDTO,
  })
  public async registerEducationLevel(@Body() body: EducationLevelDTO) {
    return await this.EducationLevelService.createEducationLevel(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las Direcciones
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las Direcciones
 * @returns Lista de Direcciones según los parámetros de consulta
 */

  @Roles("HUMAN_TALENT", "ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Nivel de Educaciones',
    description: 'Obtiene una lista de todos las Nivel de Educaciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Nivel de Educacione obtenida exitosamente',
    type: [EducationLevelDTO],
  })
  public async findAllEducationLevel(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.EducationLevelService.findEducationLevel(+page, +limit, search, req);
  }


  // @PublicAccess()
  /**
 * Obtener una dirección por su ID
 * @param id ID de la dirección a obtener
 * @returns Parroquia correspondiente al ID proporcionado
 */

  @Roles("HUMAN_TALENT", "ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Nivel de Educacion por su ID',
    description: 'Obtiene el Nivel de Educacion correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Nivel de Educacion', type: String })
  @ApiOkResponse({
    description: 'Nivel de Educacion obtenida exitosamente',
    type: EducationLevelDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Nivel de Educacion con el ID proporcionado' })
  public async findEducationLevelById(@Param('id') id: string) {
    return await this.EducationLevelService.findEducationLevelById(id);
  }


  /**
 * Buscar un dirección por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

  @Roles("HUMAN_TALENT", "ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Nivel de Educacion por cualquier clave y valor',
    description: 'Busca una Nivel de Educacion que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Nivel de Educacion encontrado exitosamente',
    type: EducationLevelDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof EducationLevelDTO; value: string },
  ) {
    
    return await this.EducationLevelService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una dirección
 * @param id Identificador de la dirección a actualizar
 * @param body Datos de actualización de la dirección
 * @returns Parroquia actualizado
 */

    @Roles("HUMAN_TALENT")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Nivel de Educacion',
    description: 'Actualiza una Nivel de Educacion existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Nivel de Educacion a actualizar', type: String })
  @ApiBody({ type: EducationLevelUpdateDTO, description: 'Datos de actualización de la Nivel de Educacion' })
  @ApiOkResponse({
    description: 'Nivel de Educacion actualizada exitosamente',
    type: EducationLevelDTO,
  })
  public async updateEducationLevel(
    @Param('id') id: string,
    @Body() body: EducationLevelUpdateDTO,
  ) {
    return await this.EducationLevelService.updateEducationLevel(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una dirección
 * @param id Identificador de la dirección a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("HUMAN_TALENT")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Nivel de Educacion',
    description: 'Elimina una Nivel de Educacion según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Nivel de Educacion a eliminar', type: String })
  @ApiOkResponse({
    description: 'Nivel de Educacion eliminado exitosamente',
    type: String,
  })
  public async deleteEducationLevel(@Param('id') id: string) {
    return await this.EducationLevelService.deleteEducationLevel(id);
  }
}
