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
import { ProfessionalTitleService } from '../services/professional-title.service';
import { FindProfessionalTitleDTO, ProfessionalTitleDTO, ProfessionalTitleUpdateDTO } from '../dto/professional-title.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('ProfessionalTitle') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('professionalTitle')
@UseGuards(AuthGuard, RolesGuard)
export class ProfessionalTitleController {
  constructor(private readonly ProfessionalTitleService: ProfessionalTitleService) {}

  // @PublicAccess()
  /**
 * Registrar ProfessionalTitle
 * @param body Datos de la dirección a registrar
 * @returns Datos de la dirección registrado
 */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Titulo',
    description: 'Registra una nueva Titulo',
  })
  @ApiBody({ type: ProfessionalTitleDTO })
  @ApiCreatedResponse({
    description: 'Titulo registrada exitosamente',
    type: ProfessionalTitleDTO,
  })
  public async registerProfessionalTitle(@Body() body: ProfessionalTitleDTO) {
    return await this.ProfessionalTitleService.createProfessionalTitle(body);
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
    summary: 'Obtener todos las Titulos',
    description: 'Obtiene una lista de todas las Titulos según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Titulos obtenida exitosamente',
    type: [ProfessionalTitleDTO],
  })
  public async findAllProfessionalTitle(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.ProfessionalTitleService.findProfessionalTitle(+page, +limit, search);
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
    summary: 'Obtener una Titulo por su ID',
    description: 'Obtiene la Titulo correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Titulo', type: String })
  @ApiOkResponse({
    description: 'Titulo obtenida exitosamente',
    type: ProfessionalTitleDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Titulo con el ID proporcionado' })
  public async findProfessionalTitleById(@Param('id') id: string) {
    return await this.ProfessionalTitleService.findProfessionalTitleById(id);
  }


  /**
 * Buscar un dirección por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

  @Roles("HUMAN_TALENT", "ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Titulo por cualquier clave y valor',
    description: 'Busca una Titulo que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Titulo encontrado exitosamente',
    type: ProfessionalTitleDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ProfessionalTitleDTO; value: string },
  ) {
    
    return await this.ProfessionalTitleService.findBy({
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
    summary: 'Actualizar una Titulo',
    description: 'Actualiza una Titulo existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Titulo a actualizar', type: String })
  @ApiBody({ type: ProfessionalTitleUpdateDTO, description: 'Datos de actualización de la Titulo' })
  @ApiOkResponse({
    description: 'Titulo actualizada exitosamente',
    type: ProfessionalTitleDTO,
  })
  public async updateProfessionalTitle(
    @Param('id') id: string,
    @Body() body: ProfessionalTitleUpdateDTO,
  ) {
    return await this.ProfessionalTitleService.updateProfessionalTitle(id, body);
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
    summary: 'Eliminar una Titulo',
    description: 'Elimina una Titulo según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Titulo a eliminar', type: String })
  @ApiOkResponse({
    description: 'Titulo eliminado exitosamente',
    type: String,
  })
  public async deleteProfessionalTitle(@Param('id') id: string) {
    return await this.ProfessionalTitleService.deleteProfessionalTitle(id);
  }
}
