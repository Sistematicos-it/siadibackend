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
import { SpecializationService } from '../services/specializations.service';
import { FindSpecializationDTO, SpecializationDTO, SpecializationUpdateDTO } from '../dto/specialization.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Specialization') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('specialization')
@UseGuards(AuthGuard, RolesGuard)
export class SpecializationController {
  constructor(private readonly SpecializationService: SpecializationService) {}

  // @PublicAccess()
  /**
 * Registrar Specialization
 * @param body Datos de la dirección a registrar
 * @returns Datos de la dirección registrado
 */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Especializacion',
    description: 'Registra una nueva Especializacion',
  })
  @ApiBody({ type: SpecializationDTO })
  @ApiCreatedResponse({
    description: 'Especializacion registrada exitosamente',
    type: SpecializationDTO,
  })
  public async registerSpecialization(@Body() body: SpecializationDTO) {
    return await this.SpecializationService.createSpecialization(body);
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
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT", "ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Especializaciones',
    description: 'Obtiene una lista de todas las Especializaciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Especializaciones obtenida exitosamente',
    type: [SpecializationDTO],
  })
  public async findAllSpecialization(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.SpecializationService.findSpecialization(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una dirección por su ID
 * @param id ID de la dirección a obtener
 * @returns Parroquia correspondiente al ID proporcionado
 */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT", "ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Especializacion por su ID',
    description: 'Obtiene la Especializacion correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Especializacion', type: String })
  @ApiOkResponse({
    description: 'Especializacion obtenida exitosamente',
    type: SpecializationDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Especializacion con el ID proporcionado' })
  public async findSpecializationById(@Param('id') id: string) {
    return await this.SpecializationService.findSpecializationById(id);
  }


  /**
 * Buscar un dirección por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

  @Roles("HUMAN_TALENT", "ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Especializacion por cualquier clave y valor',
    description: 'Busca una Especializacion que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Especializacion encontrado exitosamente',
    type: SpecializationDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof SpecializationDTO; value: string },
  ) {
    
    return await this.SpecializationService.findBy({
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
    summary: 'Actualizar una Especializacion',
    description: 'Actualiza una Especializacion existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Especializacion a actualizar', type: String })
  @ApiBody({ type: SpecializationUpdateDTO, description: 'Datos de actualización de la Especializacion' })
  @ApiOkResponse({
    description: 'Especializacion actualizada exitosamente',
    type: SpecializationDTO,
  })
  public async updateSpecialization(
    @Param('id') id: string,
    @Body() body: SpecializationUpdateDTO,
  ) {
    return await this.SpecializationService.updateSpecialization(id, body);
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
    summary: 'Eliminar una Especializacion',
    description: 'Elimina una Especializacion según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Especializacion a eliminar', type: String })
  @ApiOkResponse({
    description: 'Especializacion eliminado exitosamente',
    type: String,
  })
  public async deleteSpecialization(@Param('id') id: string) {
    return await this.SpecializationService.deleteSpecialization(id);
  }
}
