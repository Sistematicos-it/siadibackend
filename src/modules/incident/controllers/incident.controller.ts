import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IncidentService } from '../services/incident.service';
import {
  DisconnectionIncidentDTO,
  DisconnectionIncidentUpdateDTO,
  FindIncidentDTO,
  GetIncidentResultDTO,
  IncidentDTO,
  IncidentLogsDTO,
  IncidentUpdateDTO,
  ReportGetIncidentDTO,
} from '../dto/incident.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { SUPPORT_TYPE, TICKET_TYPE } from 'src/constants/enums';
import { EmployeeDTO } from 'src/modules/employee/dto/employee.dto';

@ApiTags('Incident') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('incident')
@UseGuards(AuthGuard, RolesGuard)
export class IncidentController {
  constructor(private readonly IncidentService: IncidentService) {}

  @Roles('TECHNICAL_CHIEF', 'FACILITATOR', 'COORDINATOR', 'MANAGER', 'ADMIN', "TECHNICAL_ASSISTENT")
  @Get('report-get-delivery-certificate')
  @ApiOperation({
    summary: 'Obtener todos los incidentes',
    description:
      'Obtiene una lista de todos los incidentes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'idIncident', type: String, required: false })
  @ApiQuery({ name: 'deliveryCertificateNumber', type: String, required: false })
  @ApiQuery({ name: 'supportType', enum: SUPPORT_TYPE, required: false })
  @ApiOkResponse({
    description: 'Lista de incidentes obtenida exitosamente',
    type: [IncidentDTO],
  })
  public async reportGetDeliveryCertificate(
    @Query('idIncident') idIncident: string,
    @Query('deliveryCertificateNumber') deliveryCertificateNumber: string,
    @Query('supportType') supportType: SUPPORT_TYPE// Aquí usamos una nueva clase de tubería personalizada
  ) {
    const payload: ReportGetIncidentDTO = {
      idIncident,
      deliveryCertificateNumber,
      supportType
    }
    return await this.IncidentService.reportGetDeliveryCertificate(payload);
  }

  @Roles('TECHNICAL_CHIEF', 'FACILITATOR', 'COORDINATOR', 'MANAGER', 'ADMIN')
  @Get('reportbydateandpoint')
  @ApiOperation({
    summary: 'Obtener todos los incidentes',
    description:
      'Obtiene una lista de todos los incidentes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'point', type: String, required: false })
  @ApiQuery({ name: 'log_type', enum: SUPPORT_TYPE, required: false })
  @ApiOkResponse({
    description: 'Lista de incidentes obtenida exitosamente',
    type: [IncidentDTO],
  })
  public async getIncidentsByDateRangeAndPoint(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('point') point: string, 
    @Query('log_type') log_type: SUPPORT_TYPE// Aquí usamos una nueva clase de tubería personalizada
  ) {
    return await this.IncidentService.getIncidentsByDateRangeAndPoint(
      startDate,
      endDate,
      point,
    
    );
  }

  @Roles('TECHNICAL_CHIEF', 'FACILITATOR', 'COORDINATOR', 'MANAGER', 'ADMIN', 'TECHNICAL_ASSISTENT')
  @Get('assigned/point/:point_id')
  @ApiOperation({
    summary: 'Obtener todos los incidentes',
    description:
      'Obtiene una lista de todos los incidentes según los parámetros de consulta',
  })
  @ApiParam({ name: 'point_id', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de incidentes obtenida exitosamente',
    type: [IncidentDTO],
  })
  public async getAssignedIncidentsPerPoint(
    @Param('point_id') point_id: string,
    @Req() req: Request,
  ) {
    return await this.IncidentService.getAssignedIncidentsPerPoint(
      req.idUser,
      point_id,
    );
  }

  // @PublicAccess()
  /**
   * Registrar Incident
   * @param body Datos de la incidente a registrar
   * @returns Datos de la incidente registrado
   */
  @UseGuards(AuthGuard)
  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar incidente',
    description: 'Registra una nueva incidente',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: IncidentDTO })
  @ApiCreatedResponse({
    description: 'incidente registrada exitosamente',
    type: IncidentDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerIncident(
    @Req() req: Request,
    @Body() body: IncidentDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.IncidentService.createIncident(
      req.idUser,
      body,
      files,
      req.ip,
    );
  }
  @Roles('FACILITATOR', 'COORDINATOR', 'MANAGER')
  @Post('disconnection/register')
  @ApiOperation({
    summary: 'Registrar incidente de desconexion',
    description: 'Registra un nueva incidente de desconexion',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DisconnectionIncidentDTO })
  @ApiCreatedResponse({
    description: 'incidente de desconexion registrado exitosamente',
    type: DisconnectionIncidentDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerDisconnectionIncident(
    @Req() req: Request,
    @Body() body: DisconnectionIncidentDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.IncidentService.createDisconnectionIncident(
      req.idUser,
      body,
      files,
      req.ip,
    );
  }

  /**
   * marcar incidente como resuelto
   * @param id Identificador del incidente a marcar
   * @returns ok response
   */

  @Roles('FACILITATOR', 'TECHNICAL_ASSISTENT', 'MANAGER', "COORDINATOR", 'TECHNICAL_CHIEF')
  @Patch('solve/:type/:id')
  @ApiOperation({
    summary: 'Marcar incidente como resuelto',
    description: 'Marca como resuelto el incidente ',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiParam({
    name: 'type',
    description: 'Tipo de incidente [regular, disconnection]',
    type: String,
  })
  @ApiOkResponse({
    description: 'Incidente marcado exitosamente',
  })
  public async solveIncident(
    @Param('id') id: string,
    @Param('type') type: TICKET_TYPE,
  ) {
    return await this.IncidentService.markAsSolved(id, type);
  }

  /**
   * cerrar incidente como resuelto
   * @param id Identificador del incidente a cerrar
   * @returns ok response
   */

  @Roles('FACILITATOR', 'TECHNICAL_ASSISTENT')
  @Patch('close/:type/:id')
  @ApiOperation({
    summary: 'Marcar incidente como cerrado',
    description: 'Marca como cerrado el incidente ',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiParam({
    name: 'type',
    description: 'Tipo de incidente [regular, disconnection]',
    type: String,
  })
  @ApiOkResponse({
    description: 'Incidente cerrado exitosamente',
  })
  public async closeIncident(
    @Param('id') id: string,
    @Param('type') type: TICKET_TYPE,
  ) {
    return await this.IncidentService.closeIncident(id, type);
  }

  /**
   * subir archivos al incidente
   * @param id Identificador del incidente
   * @param body archivos a subir
   * @returns ok response
   */

  @Roles('FACILITATOR')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al incidente',
    description: 'Sube nuevos archivos al incidente',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'archivos subidos exitosamente',
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async uploadIncidentFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.IncidentService.addFilesToIncident(id, files);
  }

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'COORDINATOR', "TECHNICAL_CHIEF")
  @Post('disconnection/:id/logs')
  @ApiOperation({
    summary: 'Registrar bitacora de incidente de desconexion',
    description: 'Registra una nueva bitacora de incidente de desconexion',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiBody({ type: IncidentLogsDTO })
  @ApiCreatedResponse({
    description: 'bitacora registrada exitosamente',
    type: IncidentLogsDTO,
  })
  public async registerDisconnectionIncidentLogs(
    @Param('id') id: string,
    @Body() body: IncidentLogsDTO,
    @Req() req: Request,
  ) {
    return await this.IncidentService.registerDisconnectionIncidentLogs(
      id,
      body,
      req,
    );
  }

  /**
   * Registrar IncidentLog
   * @param body Datos del log a registrar
   * @returns Datos del log registrado
   */

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'TECHNICAL_CHIEF')
  @Post(':id/logs')
  @ApiOperation({
    summary: 'Registrar bitacora de incidente',
    description: 'Registra una nueva bitacora de incidente',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiBody({ type: IncidentLogsDTO })
  @ApiCreatedResponse({
    description: 'bitacora registrada exitosamente',
    type: IncidentDTO,
  })
  public async registerIncidentLogs(
    @Param('id') id: string,
    @Body() body: IncidentLogsDTO,
    @Req() req: Request
  ) {
    return await this.IncidentService.registerIncidentLogs(id, body, req);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las incidentes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las incidentes
   * @returns Lista de incidentes según los parámetros de consulta
   */
  @UseGuards(AuthGuard)
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'TECHNICAL_CHIEF')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las incidentes',
    description:
      'Obtiene una lista de todas las incidentes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de incidentes obtenida exitosamente',
    type: [IncidentDTO],
  })
  public async findAllIncident(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.IncidentService.findIncident(
      +page,
      +limit,
      req.idUser,
      req,
    );
  }

  @UseGuards(AuthGuard)
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  // @Roles(
  //   'FACILITATOR',
  //   'MANAGER',
  //   'TECHNICAL_ASSISTENT',
  //   'COORDINATOR',
  //   'TECHNICAL_CHIEF',
  // )
  @Get('disconnection/all')
  @ApiOperation({
    summary: 'Obtener todos las incidentes de desconexion',
    description:
      'Obtiene una lista de todas las incidentes de desconexion según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de incidentes de desconexion obtenida exitosamente',
    type: [DisconnectionIncidentDTO],
  })
  public async findAllDisconnectionIncident(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.IncidentService.findDisconnectionIncident(
      +page,
      +limit,
      req.idUser,
      req,
    );
  }

  @Roles(
    'FACILITATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'COORDINATOR',
    'TECHNICAL_CHIEF',
  )
  @Get('disconnection/:id')
  @ApiOperation({
    summary: 'Obtener una incidente de desconexion por su ID',
    description:
      'Obtiene la incidente de desconexion correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la incidente de desconexion',
    type: String,
  })
  @ApiOkResponse({
    description: 'incidente de desconexion obtenida exitosamente',
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la incidente de desconexion con el ID proporcionado',
  })
  public async findDisconnectionIncidentById(@Param('id') id: string) {
    return await this.IncidentService.findDisconnectionIncidentById(id);
  }

  @UseGuards(AuthGuard)
  @Get('issue/:id/assigned-to')
  @ApiOperation({
    summary:
      'Obtener el empleado asignado a un incidente segun el tipo de incidente en el momento de su creacion',
    description:
      'Obtiene el empleado asignado a un incidente segun el tipo de incidente en el momento de su creacion',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la tipo de incidente',
    type: String,
  })
  @ApiOkResponse({
    description: 'Empleado obtenido exitosamente',
    type: EmployeeDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el tipo de incidente con el ID proporcionado',
  })
  public async getAssignedTo(@Req() req: Request, @Param('id') id: string) {
    return await this.IncidentService.getAssignedEmployee(req.idUser, id);
  }

  // @PublicAccess()
  /**
   * Obtener una incidente por su ID
   * @param id ID de la incidente a obtener
   * @returns incidente correspondiente al ID proporcionado
   */

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'TECHNICAL_CHIEF')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una incidente por su ID',
    description: 'Obtiene la incidente correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiOkResponse({
    description: 'incidente obtenida exitosamente',
    type: GetIncidentResultDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la incidente con el ID proporcionado',
  })
  public async findIncidentById(@Param('id') id: string) {
    return await this.IncidentService.findIncidentById(id);
  }

  /**
   * Buscar un incidente por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns incidente que coincide con los parámetros de búsqueda
   */

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'TECHNICAL_CHIEF')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una incidente por cualquier clave y valor',
    description:
      'Busca una incidente que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'incidente encontrado exitosamente',
    type: IncidentDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof IncidentDTO; value: string },
  ) {
    return await this.IncidentService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  @Roles('TECHNICAL_CHIEF', 'MANAGER', 'COORDINATOR')
  @Patch('disconnection/reassign/:id/employee/:employee_id')
  @ApiOperation({
    summary: 'Reasignar incidente',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiParam({
    name: 'employee_id',
    description: 'ID de la empleado',
    type: String,
  })
  @ApiBody({ type: IncidentLogsDTO })
  public async reassignDisconectionIncident(
    @Param('id') id: string,
    @Param('employee_id') employee_id: string,
  ) {
    return await this.IncidentService.reassignDisconnectionIncident(
      id,
      employee_id,
    );
  }

  @Roles('TECHNICAL_CHIEF')
  @Patch('reassign/:id/employee/:employee_id')
  @ApiOperation({
    summary: 'Reasignar incidente',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiParam({
    name: 'employee_id',
    description: 'ID de la empleado',
    type: String,
  })
  @ApiBody({ type: IncidentLogsDTO })
  public async reassignIncident(
    @Param('id') id: string,
    @Param('employee_id') employee_id: string,
  ) {
    return await this.IncidentService.reassignIncident(id, employee_id);
  }

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT', 'COORDINATOR')
  @Patch('disconnection/edit/:id')
  @ApiOperation({
    summary: 'Actualizar una incidente de desconexion',
    description:
      'Actualiza una incidente de desconexion existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del incidente se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Identificador del incidente de desconexion a actualizar',
    type: String,
  })
  @ApiBody({
    type: DisconnectionIncidentUpdateDTO,
    description: 'Datos de actualización de la incidente de desconexion',
  })
  @ApiOkResponse({
    description: 'incidente de desconexion actualizado exitosamente',
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateDisconnectionIncident(
    @Param('id') id: string,
    @Body() body: DisconnectionIncidentUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.IncidentService.updateDisconnectionIncident(
      id,
      body,
      files,
      req.idUser,
      req.ip,
    );
  }

  // @PublicAccess()
  /**
   * Actualizar una incidente
   * @param id Identificador de la incidente a actualizar
   * @param body Datos de actualización de la incidente
   * @returns incidente actualizado
   */
  @Roles('FACILITATOR', 'TECHNICAL_ASSISTENT')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una incidente',
    description:
      'Actualiza una incidente existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del incidente se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Identificador del incidente a actualizar',
    type: String,
  })
  @ApiBody({
    type: IncidentUpdateDTO,
    description: 'Datos de actualización de la incidente',
  })
  @ApiOkResponse({
    description: 'incidente actualizado exitosamente',
    type: IncidentDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateIncident(
    @Param('id') id: string,
    @Body() body: IncidentUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.IncidentService.updateIncident(
      id,
      body,
      files,
      req.idUser,
      req.ip,
    );
  }

  /**
   * Editar IncidentLog
   * @param body Datos del log a editar
   * @returns Datos del log editado
   */

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT')
  @Patch('edit/logs/:id')
  @ApiOperation({
    summary: 'Editar bitacora de incidente',
    description: 'Editar una nueva bitacora de incidente',
  })
  @ApiParam({ name: 'id', description: 'ID de la incidente', type: String })
  @ApiBody({ type: IncidentLogsDTO })
  @ApiOkResponse({
    description: 'bitacora editada exitosamente',
  })
  public async editIncidentLogs(
    @Param('id') id: string,
    @Body() body: IncidentLogsDTO,
  ) {
    return await this.IncidentService.updateIncidentLogs(id, body);
  }

  @Roles('FACILITATOR')
  @Delete('disconnection/delete/:id')
  @ApiOperation({
    summary: 'Eliminar una incidente de desconexion',
    description:
      'Elimina una incidente de desconexion según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la incidente de desconexion a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'incidente de desconexion eliminado exitosamente',
    type: String,
  })
  public async deleteDisconnectionIncident(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return await this.IncidentService.deleteDisconnectionIncident(
      id,
      req.idUser,
      req.ip,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una incidente
   * @param id Identificador de la incidente a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */
  @Roles('FACILITATOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una incidente',
    description: 'Elimina una incidente según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la incidente a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'incidente eliminado exitosamente',
    type: String,
  })
  public async deleteIncident(@Param('id') id: string, @Req() req: Request) {
    return await this.IncidentService.deleteIncident(id, req.idUser, req.ip);
  }

  // @PublicAccess()
  /**
   * Eliminar una bitacora
   * @param id Identificador de la bitacora a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('FACILITATOR', 'MANAGER', 'TECHNICAL_ASSISTENT')
  @Delete('logs/delete/:id')
  @ApiOperation({
    summary: 'Eliminar una bitacora',
    description: 'Elimina una bitacora según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la bitacora a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'bitacora eliminado exitosamente',
    type: String,
  })
  public async deleteIncidentLog(@Param('id') id: string) {
    return await this.IncidentService.deleteIncidentLog(id);
  }

  // @PublicAccess()
  /**
   * Eliminar un activo con incidentes
   * @param id Identificador del activo con incidentes a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */
  @Roles('FACILITATOR')
  @Delete('asset/delete/:id')
  @ApiOperation({
    summary: 'Eliminar un activo con incidentes',
    description:
      'Elimina un activo con incidentes según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del activo con incidentes a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'incidente eliminado exitosamente',
    type: String,
  })
  public async deleteIncidentAsset(@Param('id') id: string) {
    return await this.IncidentService.deleteIncidentAsset(id);
  }
}
