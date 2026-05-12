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
  UseGuards,
} from '@nestjs/common';
import { FileCategoryService } from '../services/file-category.service';
import { FindFileCategoryDTO, FileCategoryDTO, FileCategoryUpdateDTO } from '../dto/file-category.dto';

import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('FileCategory') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('file-category')
@UseGuards(AuthGuard, RolesGuard)
export class FileCategoryController {
  constructor(private readonly FileCategoryService: FileCategoryService) {}

  // @PublicAccess()
  /**
 * Registrar FileCategory
 * @param body Datos de la institucion a registrar
 * @returns Datos de la institucion registrado
 */
  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Categoria de Archivo',
    description: 'Registra una nueva Categoria de Archivo',
  })
  @ApiBody({ type: FileCategoryDTO })
  @ApiCreatedResponse({
    description: 'Categoria de Archivo registrada exitosamente',
    type: FileCategoryDTO,
  })
  public async registerFileCategory(@Body() body: FileCategoryDTO) {
    const { name } = body;
    const nameExists = await this.FileCategoryService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de categoria ya existe');
    }
    return await this.FileCategoryService.createFileCategory(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las instituciones
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las instituciones
 * @returns Lista de instituciones según los parámetros de consulta
 */
  @Roles("ADMIN", "HUMAN_TALENT", "COORDINATOR", "FACILITATOR", "TECHNICAL_ASSISTENT", "TECHNICAL_CHIEF", "MANAGER", "MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Categorias de Archivos',
    description: 'Obtiene una lista de todas las Categorias de Archivos según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Categorias de Archivos obtenida exitosamente',
    type: [FileCategoryDTO],
  })
  public async findAllFileCategory(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.FileCategoryService.findFileCategory(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una institucion por su ID
 * @param id ID de la institucion a obtener
 * @returns institucion correspondiente al ID proporcionado
 */

    @Roles("ADMIN", "HUMAN_TALENT", "COORDINATOR", "FACILITATOR", "TECHNICAL_ASSISTENT", "TECHNICAL_CHIEF", "MANAGER", "MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Categoria de Archivo por su ID',
    description: 'Obtiene la Categoria de Archivo correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Categoria de Archivo', type: String })
  @ApiOkResponse({
    description: 'Categoria de Archivo obtenida exitosamente',
    type: FileCategoryDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Categoria de Archivo con el ID proporcionado' })
  public async findFileCategoryById(@Param('id') id: string) {
    return await this.FileCategoryService.findFileCategoryById(id);
  }


  /**
 * Buscar un institucion por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns institucion que coincide con los parámetros de búsqueda
 */
  @Roles("ADMIN", "HUMAN_TALENT", "COORDINATOR", "FACILITATOR", "TECHNICAL_ASSISTENT", "TECHNICAL_CHIEF", "MANAGER", "MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Categoria de Archivo por cualquier clave y valor',
    description: 'Busca una Categoria de Archivo que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Categoria de Archivo encontrado exitosamente',
    type: FileCategoryDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof FileCategoryDTO; value: string },
  ) {
    
    return await this.FileCategoryService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una institucion
 * @param id Identificador de la institucion a actualizar
 * @param body Datos de actualización de la institucion
 * @returns institucion actualizado
 */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Categoria de Archivo',
    description: 'Actualiza una Categoria de Archivo existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Categoria de Archivo a actualizar', type: String })
  @ApiBody({ type: FileCategoryUpdateDTO, description: 'Datos de actualización de la Categoria de Archivo' })
  @ApiOkResponse({
    description: 'Categoria de Archivo actualizada exitosamente',
    type: FileCategoryDTO,
  })
  public async updateFileCategory(
    @Param('id') id: string,
    @Body() body: FileCategoryUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.FileCategoryService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de categoria ya existe');
    }
    return await this.FileCategoryService.updateFileCategory(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una institucion
 * @param id Identificador de la institucion a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */
  @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Categoria de Archivo',
    description: 'Elimina una Categoria de Archivo según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Categoria de Archivo a eliminar', type: String })
  @ApiOkResponse({
    description: 'Categoria de Archivo eliminado exitosamente',
    type: String,
  })
  public async deleteFileCategory(@Param('id') id: string) {
    return await this.FileCategoryService.deleteFileCategory(id);
  }
}
