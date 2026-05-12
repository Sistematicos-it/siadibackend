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
import { AttendanceService } from '../services/attendance.service';
import {
  FindAttendanceDTO,
  AttendanceDTO,
  AttendanceUpdateDTO,
} from '../dto/attendance.dto';

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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('Attendance') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('attendance')
@UseGuards(AuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // @PublicAccess()
  /**
   * Registrar Attendance
   * @param body Datos de la asistencia a registrar
   * @returns Datos de la asistencia registrado
   */
  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Asistencia',
    description: 'Registra una nueva Asistencia',
  })
  @ApiBody({ type: AttendanceDTO })
  @ApiCreatedResponse({
    description: 'Asistencia registrada exitosamente',
    type: AttendanceDTO,
  })
  public async registerAttendance(
    @Body() body: AttendanceDTO,
    @Req() req: Request,
  ) {
    return await this.attendanceService.createAttendance(
      body,
      req.idUser,
      req.ip,
    );
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las asistenciaes
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las asistenciaes
   * @returns Lista de asistenciaes según los parámetros de consulta
   */

  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Asistencias',
    description:
      'Obtiene una lista de todas las Asistencias según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de Asistencias obtenida exitosamente',
    type: [AttendanceDTO],
  })
  public async findAllAttendance(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.attendanceService.findAttendance(
      +page,
      +limit,
      req.idUser,
      req,
    );
  }

  @Roles(
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get('report/employee/:employee_id')
  @ApiOperation({
    summary: 'Obtener reporte de asistencias',
    description:
      'Obtiene una lista de todas las Asistencias según los parámetros de consulta',
  })
  @ApiParam({ name: 'employee_id', type: String, required: true })
  @ApiQuery({ name: 'start_date', type: String, required: false })
  @ApiQuery({ name: 'end_date', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Asistencias obtenida exitosamente',
    type: [AttendanceDTO],
  })
  public async generateAttendanceReport(
    @Param('employee_id') id: string,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    return await this.attendanceService.generateAttendanceReport(
      id,
      start_date,
      end_date,
    );
  }

  @Roles(
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get('attendance-summary/:start_date/:end_date')
  @ApiOperation({
    summary: 'Obtener reporte de asistencias',
    description:
      'Obtiene una lista de todas las Asistencias según los parámetros de consulta',
  })
  @ApiParam({ name: 'start_date', type: String, required: true })
  @ApiParam({ name: 'end_date', type: String, required: true })
  @ApiOkResponse({
    description: 'Lista de Asistencias obtenida exitosamente',
    type: [AttendanceDTO],
  })
  public async findAllSubordinateAttendances(
    @Req() req: Request,
    @Param('start_date') start_date: string,
    @Param('end_date') end_date: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    
  ) {
    return await this.attendanceService.findAllSubordinateAttendances(
      start_date,
      end_date,
      req.idUser,
      +page,
      +limit
    );
  }

  

  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get('subordinate/:id')
  @ApiOperation({
    summary: 'Obtener todos las Asistencias',
    description:
      'Obtiene una lista de todas las Asistencias según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de Asistencias obtenida exitosamente',
    type: [AttendanceDTO],
  })
  public async findSubordinateAttendances(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return await this.attendanceService.findSubordinateAttendance(
      +page,
      +limit,
      req.idUser,
      id,
      req
    );
  }

  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get('employee/:id')
  @ApiOperation({
    summary: 'Obtener las asistencias de un empleado',
    description: 'Obtiene una lista con las asistencias de un empleado',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: String })
  @ApiOkResponse({
    description: 'lista de asistencias obtenida exitosamente',
    type: AttendanceDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se el empleado proporcionado',
  })
  public async findAttendanceByEmployeeId(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request
  ) {
    return await this.attendanceService.findEmployeeAttendance(
      id,
      +page,
      +limit,
      req
    );
  }

  // @PublicAccess()
  /**
   * Obtener una asistencia por su ID
   * @param id ID de la asistencia a obtener
   * @returns asistencia correspondiente al ID proporcionado
   */
  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Asistencia por su ID',
    description: 'Obtiene la Asistencia correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Asistencia', type: String })
  @ApiOkResponse({
    description: 'Asistencia obtenida exitosamente',
    type: AttendanceDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Asistencia con el ID proporcionado',
  })
  public async findAttendanceById(@Param('id') id: string) {
    return await this.attendanceService.findAttendanceById(id);
  }

  /**
   * Buscar un asistencia por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns asistencia que coincide con los parámetros de búsqueda
   */

  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Asistencia por cualquier clave y valor',
    description:
      'Busca una Asistencia que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Asistencia encontrado exitosamente',
    type: AttendanceDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof AttendanceDTO; value: string },
  ) {
    return await this.attendanceService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una asistencia
   * @param id Identificador de la asistencia a actualizar
   * @param body Datos de actualización de la asistencia
   * @returns asistencia actualizado
   */
  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Asistencia',
    description:
      'Actualiza una Asistencia existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Asistencia a actualizar',
    type: String,
  })
  @ApiBody({
    type: AttendanceUpdateDTO,
    description: 'Datos de actualización de la Asistencia',
  })
  @ApiOkResponse({
    description: 'Asistencia actualizada exitosamente',
    type: AttendanceDTO,
  })
  public async updateAttendance(
    @Param('id') id: string,
    @Body() body: AttendanceUpdateDTO,
    @Req() req: Request,
  ) {
    return await this.attendanceService.updateAttendance(
      id,
      body,
      req.idUser,
      req.ip,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una asistencia
   * @param id Identificador de la asistencia a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */
  @Roles(
    'TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
  )
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Asistencia',
    description: 'Elimina una Asistencia según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Asistencia a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Asistencia eliminado exitosamente',
    type: String,
  })
  public async deleteAttendance(@Param('id') id: string, @Req() req: Request) {
    return await this.attendanceService.deleteAttendance(
      id,
      req.idUser,
      req.ip,
    );
  }
}
