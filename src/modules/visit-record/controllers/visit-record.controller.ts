import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VisitRecordService } from '../services/visit-record.service';
import {
  ITotalVisitArrayDTO,
  VisitCountDTO,
  VisitRecordDTO,
  VisitTotalDTO,
} from '../dto/visit-record.dto';
import {
  ITotalVisits,
  IVisitRecord,
} from '../interfaces/visit-record.interface';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('VisitRecord') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('visit-record')
@UseGuards(AuthGuard, RolesGuard)
export class VisitRecordController {
  constructor(private readonly VisitRecordService: VisitRecordService) {}

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los registro de visita
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos registro de visita
   * @returns Lista de registro de visita según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los registro de visita',
    description:
      'Obtiene una lista de todaslos registro de visita según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de registro de visita obtenida exitosamente',
    type: [VisitRecordDTO],
  })
  public async findAllVisitRecord(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.VisitRecordService.findVisitRecord(+page, +limit);
  }

  @Post('visit-total')
  @ApiOperation({
    summary: 'Obtener el total de visitas por PDE',
  })
  @ApiBody({ type: VisitTotalDTO })
  @ApiOkResponse({ type: ITotalVisitArrayDTO })
  public async getVisitTotal(@Body() body: VisitTotalDTO) {
    return await this.VisitRecordService.generateVisitRecordPerPoint(
      body.point_ids,
    );
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los registro de visita de un ciudadano
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param id identiifcador del ciudadano
   * @returns Lista de registro de visita según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('citizen/:id')
  @ApiOperation({
    summary: 'Obtener todos los registro de visita de un ciudadano',
    description:
      'Obtiene una lista de todaslos registro de visita según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOkResponse({
    description: 'Lista de registro de visita obtenida exitosamente',
    type: [VisitRecordDTO],
  })
  public async filterByCitizen(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
  ) {
    return await this.VisitRecordService.filterByCitizen(+page, +limit, id);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener un conteo de todos los registro de visita de un punto
   
   * @param id identiifcador del punto
   * @returns Lista de registro de visita según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('point/count/:id')
  @ApiOperation({
    summary: 'Obtener un conteo de visitas en un punto',
    description:
      'Obtiene una lista de todaslos registro de visita según los parámetros de consulta',
  })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOkResponse({
    description: 'conteo de visitas obtenida exitosamente',
    type: [VisitCountDTO],
  })
  public async countByPoint(@Param('id') id: string) {
    return await this.VisitRecordService.getCountByPoint(id);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los registro de visita de un punto
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param id identiifcador del punto
   * @returns Lista de registro de visita según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('point/:id')
  @ApiOperation({
    summary: 'Obtener todos los registro de visita en un punto',
    description:
      'Obtiene una lista de todaslos registro de visita según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOkResponse({
    description: 'Lista de registro de visita obtenida exitosamente',
    type: [VisitRecordDTO],
  })
  public async filterByPoint(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
  ) {
    return await this.VisitRecordService.filterByPoint(+page, +limit, id);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los registro de visita de un tipo de visita
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param id identiifcador del tipo de visita
   * @returns Lista de registro de visita según los parámetros de consulta
   */

  @Roles('ADMIN')
  @Get('type/:id')
  @ApiOperation({
    summary: 'Obtener todos los registro de visita de un tipo de visita',
    description:
      'Obtiene una lista de todaslos registro de visita según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOkResponse({
    description: 'Lista de registro de visita obtenida exitosamente',
    type: [VisitRecordDTO],
  })
  public async filterByType(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
  ) {
    return await this.VisitRecordService.filterByType(+page, +limit, id);
  }

  @Roles('ADMIN', "MONITOR")
  @Get('total/:start_date/:end_date')
  @ApiOperation({
    summary: 'Obtener total de visita por su fecha',
  })
  @ApiParam({
    name: 'start_date',
    description: 'fecha de inicio',
    type: Date,
  })
  @ApiParam({
    name: 'end_date',
    description: 'fecha final',
    type: Date,
  })
  @ApiOkResponse({
    description: 'total de visita obtenida exitosamente',
  })
  public async getVisitTotalsByDate(
    @Param('start_date') start_date: string,
    @Param('end_date') end_date: string,
  ) {
    //return await this.VisitRecordService.getVisitTotalsByDate(    
    return await this.VisitRecordService.summarizeVisitTotalsByDate(    
      new Date(start_date),
      new Date(end_date),
    );
  }

  // @PublicAccess()
  /**
   * Obtener una registro de visita por su ID
   * @param id ID del registro de visita a obtener
   * @returns registro de visita correspondiente al ID proporcionado
   */

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una registro de visita por su ID',
    description:
      'Obtiene la registro de visita correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de visita',
    type: String,
  })
  @ApiOkResponse({
    description: 'registro de visita obtenida exitosamente',
    type: VisitRecordDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la registro de visita con el ID proporcionado',
  })
  public async findVisitRecordById(@Param('id') id: string) {
    return await this.VisitRecordService.findVisitRecordById(id);
  }

  /**
   * Buscar un registro de visita por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns registro de visita que coincide con los parámetros de búsqueda
   */

  @Roles('ADMIN')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una registro de visita por cualquier clave y valor',
    description:
      'Busca una registro de visita que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'registro de visita encontrado exitosamente',
    type: VisitRecordDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof VisitRecordDTO; value: string },
  ) {
    return await this.VisitRecordService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Eliminar una registro de visita
   * @param id Identificador del registro de visita a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una registro de visita',
    description:
      'Elimina una registro de visita según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del registro de visita a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'registro de visita eliminado exitosamente',
    type: String,
  })
  public async deleteVisitRecord(@Param('id') id: string) {
    return await this.VisitRecordService.deleteVisitRecord(id);
  }
}
