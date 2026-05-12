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
import { ReasonForVisitService } from '../services/reason-for-visit.service';
import { FindReasonForVisitDTO, ReasonForVisitDTO, ReasonForVisitUpdateDTO } from '../dto/reason-for-visit.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('ReasonForVisit') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('reason-for-visit')
@UseGuards(AuthGuard, RolesGuard)
export class ReasonForVisitController {
  constructor(private readonly ReasonForVisitService: ReasonForVisitService) {}

  // @PublicAccess()
  /**
 * Registrar ReasonForVisit
 * @param body Datos de la dirección a registrar
 * @returns Datos de la dirección registrado
 */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Motivo de Visita',
    description: 'Registra una nueva Motivo de Visita',
  })
  @ApiBody({ type: ReasonForVisitDTO })
  @ApiCreatedResponse({
    description: 'Motivo de Visita registrada exitosamente',
    type: ReasonForVisitDTO,
  })
  public async registerReasonForVisit(@Body() body: ReasonForVisitDTO) {
    const { name } = body;
    const nameExists = await this.ReasonForVisitService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de motivo de visita ya existe');
    }
    return await this.ReasonForVisitService.createReasonForVisit(body);
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

    @Roles("ADMIN", "CITIZEN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Motivo de Visitaes',
    description: 'Obtiene una lista de todas las Motivo de Visitaes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Motivo de Visitaes obtenida exitosamente',
    type: [ReasonForVisitDTO],
  })
  public async findAllReasonForVisit(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.ReasonForVisitService.findReasonForVisit(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una dirección por su ID
 * @param id ID de la dirección a obtener
 * @returns Parroquia correspondiente al ID proporcionado
 */

  @Roles("ADMIN", "CITIZEN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Motivo de Visita por su ID',
    description: 'Obtiene la Motivo de Visita correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Motivo de Visita', type: String })
  @ApiOkResponse({
    description: 'Motivo de Visita obtenida exitosamente',
    type: ReasonForVisitDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Motivo de Visita con el ID proporcionado' })
  public async findReasonForVisitById(@Param('id') id: string) {
    return await this.ReasonForVisitService.findReasonForVisitById(id);
  }


  /**
 * Buscar un dirección por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

  @Roles("ADMIN", "CITIZEN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Motivo de Visita por cualquier clave y valor',
    description: 'Busca una Motivo de Visita que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Motivo de Visita encontrado exitosamente',
    type: ReasonForVisitDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ReasonForVisitDTO; value: string },
  ) {
    
    return await this.ReasonForVisitService.findBy({
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

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Motivo de Visita',
    description: 'Actualiza una Motivo de Visita existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Motivo de Visita a actualizar', type: String })
  @ApiBody({ type: ReasonForVisitUpdateDTO, description: 'Datos de actualización de la Motivo de Visita' })
  @ApiOkResponse({
    description: 'Motivo de Visita actualizada exitosamente',
    type: ReasonForVisitDTO,
  })
  public async updateReasonForVisit(
    @Param('id') id: string,
    @Body() body: ReasonForVisitUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.ReasonForVisitService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de motivo de visita ya existe');
    }
    return await this.ReasonForVisitService.updateReasonForVisit(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una dirección
 * @param id Identificador de la dirección a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Motivo de Visita',
    description: 'Elimina una Motivo de Visita según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Motivo de Visita a eliminar', type: String })
  @ApiOkResponse({
    description: 'Motivo de Visita eliminado exitosamente',
    type: String,
  })
  public async deleteReasonForVisit(@Param('id') id: string) {
    return await this.ReasonForVisitService.deleteReasonForVisit(id);
  }
}
