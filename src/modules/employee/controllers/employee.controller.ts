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
  Req,
} from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import {
  FindEmployeeDTO,
  EmployeeDTO,
  EmployeeUpdateDTO,
  AssignEmployeeRoleDTO,
  AssignEmployeeSubordinateDTO,
  CommandChainResultDTO,
  UpdateCommandChainDTO,
  ReassignCommandChainDTO,
  RessignRequestDTO,
  TransferDTO,
} from '../dto/employee.dto';
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
import {
  AddFileToPeriodDTO,
  EmployeePeriodDTO,
  EmployeePeriodUpdateDTO,
} from '../dto/employee-period.dto';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { ROLES } from 'src/constants';
import { COMMAND_TYPE } from 'src/constants/enums';
import { EmployeeEntity } from '../entities/employee.entity';
import { Request } from 'express';

@ApiTags('Employee') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('employee')
@UseGuards(AuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly EmployeeService: EmployeeService) {}

  @Roles('HUMAN_TALENT', 'ADMIN', 'MANAGER')
  @Post('transfer-employee/:id/:destination_point')
  @ApiOperation({
    summary: 'transferir Empleado',
    description: 'transfiere un Empleado',
  })
  @ApiBody({ type: TransferDTO })
  @ApiCreatedResponse({
    description: 'Empleado transferido exitosamente',
  })
  public async transferEmployee(
    @Param('id') id: string,
    @Param('destination_point') destination_point: string,
    @Body() body: TransferDTO,
    @Req() req: Request,
  ) {
    return await this.EmployeeService.transferEmployee(
      id,
      destination_point,
      body.reason,
      req,
    );
  }

  @Roles('HUMAN_TALENT', 'ADMIN', 'FACILITATOR', 'MANAGER')
  @Get('employee-transfer/all')
  @ApiOperation({
    summary: 'Obtener todos las Empleados',
    description:
      'Obtiene una lista de todos los Empleados según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'user_id', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Empleados obtenida exitosamente',
    type: [EmployeeDTO],
  })
  public async findEmployeeTransfer(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('user_id') user_id: string,
    @Req() req: Request,
  ) {
    return await this.EmployeeService.getEmployeeTransfer(
      +page,
      +limit,
      user_id,
      req,
    );
  }

  // @PublicAccess()
  /**
   * Registrar Employee
   * @param body Datos de la empleado a registrar
   * @returns Datos de la empleado registrado
   */
  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Empleado',
    description: 'Registra un nuevo Empleado',
  })
  @ApiBody({ type: EmployeeDTO })
  @ApiCreatedResponse({
    description: 'Empleado registrado exitosamente',
    type: EmployeeDTO,
  })
  public async registerEmployee(
    @Body() body: EmployeeDTO,
    @Req() req: Request,
  ) {
    await this.EmployeeService.validateUniqueValues(body.email, body.id_value);
    return await this.EmployeeService.createEmployee(body, req.idUser, req.ip);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las Empleados
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Empleados
   * @returns Lista de Empleados según los parámetros de consulta
   */

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
    'TECHNICAL_CHIEF',
  )
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Empleados',
    description:
      'Obtiene una lista de todos los Empleados según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'usertype', enum: ROLES, required: false })
  @ApiOkResponse({
    description: 'Lista de Empleados obtenida exitosamente',
    type: [EmployeeDTO],
  })
  public async findAllEmployee(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return await this.EmployeeService.findEmployee(+page, +limit, req);
  }

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
  )
  @Get('role/unassigned/:role')
  @ApiOperation({
    summary: 'filtrar empleados no subordinados por rol',
    description:
      'Obtiene una lista de todos los Empleados no subordinados según un rol proporcionado',
  })
  @ApiParam({ name: 'role', enum: ROLES, required: false })
  @ApiOkResponse({
    description: 'Lista de Empleados no subordinados obtenida exitosamente',
    type: [EmployeeDTO],
  })
  public async filterByUnnasigned(@Param('role') name: ROLES) {
    return await this.EmployeeService.getUnnasignedEmployeesByRole(name);
  }

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
    'TECHNICAL_CHIEF',
  )
  @Get('role/id/:id')
  @ApiOperation({
    summary: 'filtrar empleados por rol',
    description:
      'Obtiene una lista de todos los Empleados según un rol proporcionado',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Empleados obtenida exitosamente',
    type: [EmployeeDTO],
  })
  public async filterByRoleId(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
  ) {
    return await this.EmployeeService.filterEmployeeByRoleId(+page, +limit, id);
  }

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
    'TECHNICAL_CHIEF',
  )
  @Get('role/name/:name')
  @ApiOperation({
    summary: 'filtrar empleados por rol',
    description:
      'Obtiene una lista de todos los Empleados según un rol proporcionado',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'name', enum: ROLES, required: false })
  @ApiOkResponse({
    description: 'Lista de Empleados obtenida exitosamente',
    type: [EmployeeDTO],
  })
  public async filterByRoleName(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('name') name: ROLES,
  ) {
    return await this.EmployeeService.filterEmployeeByRoleName(
      +page,
      +limit,
      name,
    );
  }

  @Get('command-chain/facilitator')
  @ApiOperation({
    summary: 'obtiene los facilitadores que estan en una cadena de mando',
    description: 'obtiene los facilitadores que estan en una cadena de mando',
  })
  @ApiOkResponse({
    description: 'Facilitadores obtenidos exitosamente',
    type: [EmployeeEntity],
  })
  public async getCommandChainFacilitators() {
    return await this.EmployeeService.findCommandChainFacilitators();
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Get('command-chain/:id')
  @ApiOperation({
    summary: 'Obtener la cadena de mando',
    description: 'Obtiene la cadena de mando dado un facilitador',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'identificador del facilitador',
  })
  @ApiOkResponse({
    description: 'Cadena de mando obtenida exitosamente',
    type: CommandChainResultDTO,
  })
  public async getCommandChain(@Param('id') id: string) {
    return await this.EmployeeService.getCommandChain(id);
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Get('period/:id')
  @ApiOperation({
    summary: 'Obtener un Periodo de empleado por su ID',
    description:
      'Obtiene el Periodo de empleado correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del Periodo de empleado',
    type: String,
  })
  @ApiOkResponse({
    description: 'Periodo de empleado obtenido exitosamente',
    type: EmployeePeriodDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el Empleado con el ID proporcionado',
  })
  public async findEmployeePeriodById(@Param('id') id: string) {
    return await this.EmployeeService.findEmployeePeriodById(id);
  }

  @Get('send-rennounce')
  @ApiOperation({
    summary: 'Enviar carta de renunciaa',
    description: 'Enviar carta de renuncia de un empleado al talento humano',
  })
  @ApiBody({
    type: RessignRequestDTO,
  })
  @ApiOkResponse({
    description: 'Empleado actualizada exitosamente',
  })
  public async sendRessignLetter(@Req() req: Request) {
    return await this.EmployeeService.sendRessignLetter(req.idUser);
  }

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
  )
  @Get('facilitator-report/:id')
  @ApiOperation({
    summary: 'Obtener el reporte de un facilitador por su ID',
    description:
      'Obtiene el reporte de un facilitador correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del Empleado', type: String })
  @ApiOkResponse({
    description: 'reporte obtenido exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el Empleado con el ID proporcionado',
  })
  public async getFacilitatorDataReport(@Param('id') id: string) {
    return await this.EmployeeService.getFacilitatorDataReport(id);
  }

  // @PublicAccess()
  /**
   * Obtener una empleado por su ID
   * @param id ID de la empleado a obtener
   * @returns empleado correspondiente al ID proporcionado
   */

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
    'TECHNICAL_CHIEF',
  )
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un Empleado por su ID',
    description: 'Obtiene el Empleado correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del Empleado', type: String })
  @ApiOkResponse({
    description: 'Empleado obtenido exitosamente',
    type: EmployeeDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el Empleado con el ID proporcionado',
  })
  public async findEmployeeById(@Param('id') id: string) {
    return await this.EmployeeService.findEmployeeById(id);
  }

  /**
   * Buscar un empleado por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Empleado que coincide con los parámetros de búsqueda
   */

  @Roles(
    'HUMAN_TALENT',
    'ADMIN',
    'MONITOR',
    'FACILITATOR',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_ASSISTENT',
    'ADMIN',
  )
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar un Empleado por cualquier clave y valor',
    description:
      'Busca un Empleado que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Empleado encontrado exitosamente',
    type: EmployeeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof EmployeeDTO; value: string },
  ) {
    return await this.EmployeeService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una empleado
   * @param id Identificador de la empleado a actualizar
   * @param body Datos de actualización de la empleado
   * @returns Empleado actualizado
   */

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar un Empleado',
    description: 'Actualiza un Empleado existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Empleado a actualizar',
    type: String,
  })
  @ApiBody({
    type: EmployeeUpdateDTO,
    description: 'Datos de actualización de la Empleado',
  })
  @ApiOkResponse({
    description: 'Empleado actualizada exitosamente',
    type: EmployeeDTO,
  })
  public async updateEmployee(
    @Param('id') id: string,
    @Body() body: EmployeeUpdateDTO,
    @Req() req: Request,
  ) {
    return await this.EmployeeService.updateEmployee(
      id,
      body,
      req.idUser,
      req.ip,
    );
  }

  @Patch('command-chain/reassign/:type')
  @ApiOperation({
    summary: 'reasignar un empleado a la cadena de mando',
    description:
      'reasignar un empleado a la cadena de mando con los datos proporcionados',
  })
  @ApiParam({
    name: 'type',
    description: 'tipo de empleado a reasignar',
    enum: COMMAND_TYPE,
  })
  @ApiBody({
    type: ReassignCommandChainDTO,
    description: 'Datos de actualización de la cadena de mando',
  })
  @ApiOkResponse({
    description: 'cadena de mando reasignada exitosamente',
  })
  public async reassignCommandChain(
    @Param('type') type: COMMAND_TYPE,
    @Body() body: ReassignCommandChainDTO,
  ) {
    return await this.EmployeeService.reassignCommandChain(
      body.old_id,
      body.new_id,
      type,
    );
  }

  @Patch('command-chain/edit/:id')
  @ApiOperation({
    summary: 'Actualizar cadena de mando',
    description: 'Actualizar una cadena de mandocon los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'identificador de la cadena de mando',
    type: String,
  })
  @ApiBody({
    type: UpdateCommandChainDTO,
    description: 'Datos de actualización de la cadena de mando',
  })
  @ApiOkResponse({
    description: 'cadena de mando actualizada exitosamente',
  })
  public async updateCommandChain(
    @Param('id') id: string,
    @Body() body: UpdateCommandChainDTO,
  ) {
    return await this.EmployeeService.updateCommandChain(id, body);
  }

  @Patch('renounce/:id')
  @ApiOperation({
    summary: 'Marcar un Empleado como desvinculado',
    description:
      'Marca Empleado como desvinculado con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Empleado a actualizar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Empleado actualizada exitosamente',
  })
  public async renounceEmployee(@Param('id') id: string) {
    return await this.EmployeeService.MarkEmployeeAsUnbound(id);
  }

  /**
   * Actualizar un periodo de un empleado
   * @param id Identificador de la empleado a actualizar
   * @param period_id Identificador del periodo de empleado a actualizar
   * @param body Datos de actualización de la empleado
   * @returns Empleado actualizado
   */

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Patch('edit/:id/period/:period_id')
  @ApiOperation({
    summary: 'Actualizar un Periodo de un Empleado',
    description:
      'Actualiza un Periodo de un Empleado existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'period_id',
    description: 'Identificador del Periodo de un Empleado a actualizar',
    type: String,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Empleado a actualizar',
    type: String,
  })
  @ApiBody({
    type: EmployeePeriodUpdateDTO,
    description: 'Datos de actualización de la Periodo',
  })
  @ApiOkResponse({
    description: 'Periodo actualizada exitosamente',
    type: EmployeeDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateEmployeePeriod(
    @Param('id') id: string,
    @Param('period_id') period_id: string,
    @Body() body: EmployeePeriodUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.EmployeeService.updateEmployeePeriod(
      id,
      period_id,
      body,
      files,
    );
  }

  /**
   * Añade archivos a un periodo de un empleado
   * @param id identificador del periodo a actualizar
   * @returns archivo añadido
   */

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post('/period/:id/file')
  @ApiOperation({
    summary: 'Añadir archivos a un periodo de empleado',
    description:
      'Permite agregar los documentos que sean necesarios para cada periodo',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del periodo al cual se le añadira el archivo',
    type: String,
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
  @ApiOkResponse({
    description: 'Archivo añadido',
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async addFileToPeriod(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.EmployeeService.addFileToEmployeePeriod(id, files);
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post(':id/role/:role_name')
  @ApiOperation({
    summary: 'Asignar un rol a un empleado',
    description: 'Asigna un rol a un empleado determinado',
  })
  @ApiParam({ name: 'id', type: String, required: false })
  @ApiParam({
    name: 'role_name',
    type: String,
    required: false,
    description:
      'Nombre del rol a asignar, facilitator, manager, coordinator, technical_assistent',
  })
  @ApiBody({
    type: AssignEmployeeRoleDTO,
    required: false,
    description: 'Requerido solo en caso de asignar el rol de facilitador',
  })
  @ApiOkResponse({
    description: 'Rol Asignado exitosamente',
  })
  public async assignRole(
    @Param('id') id: string,
    @Param('role_name') role_name: string,
    @Body() body: AssignEmployeeRoleDTO,
  ) {
    return await this.EmployeeService.assignRoleToEmployee(id, role_name, body);
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post(':id/roles/:role_id')
  @ApiOperation({
    summary: 'Asignar un rol a un empleado',
    description: 'Asigna un rol a un empleado determinado',
  })
  @ApiParam({ name: 'id', type: String, required: false })
  @ApiParam({
    name: 'role_id',
    type: String,
    required: false,
    description:
      'Nombre del rol a asignar, facilitator, manager, coordinator, technical_assistent',
  })
  @ApiOkResponse({
    description: 'Rol Asignado exitosamente',
  })
  public async assignRoles(
    @Param('id') id: string,
    @Param('role_id') role_id: string,
  ) {
    return await this.EmployeeService.assignRolesToEmployee(id, role_id);
  }

  // @PublicAccess()
  /**
   * Eliminar una rol con usuario
   * @param id Identificador de la user rol a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Delete('delete/roluser/:id')
  @ApiOperation({
    summary: 'Eliminar un Rol User',
    description: 'Elimina un Rol según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Rol User a eliminar',
    type: String,
  })
  public async deleteRolesToEmployee(@Param('id') id: string) {
    return await this.EmployeeService.deleteRolesToEmployee(id);
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post(':id/subordinates')
  @ApiOperation({
    summary: 'Asignar un subordinado a un coordinador',
    description: 'Asigna un subordinado a un coordinador determinado',
  })
  @ApiParam({ name: 'id', type: String, required: false })
  @ApiBody({
    type: AssignEmployeeSubordinateDTO,
  })
  @ApiOkResponse({
    description: 'Rol Asignado exitosamente',
  })
  public async assignSubordinate(
    @Param('id') id: string,
    @Body() body: AssignEmployeeSubordinateDTO,
  ) {
    return await this.EmployeeService.AssignSubordinateToCoordinator(id, body);
  }

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Post(':id/period')
  @ApiOperation({
    summary: 'Añadir un periodo a un empleado',
    description:
      'Permite agregar un periodo de trabajo a un empleado determiando',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del empleado',
    type: String,
  })
  @ApiOkResponse({
    description: 'Periodo añadido',
  })
  public async addPeriodToEmployee(
    @Param('id') id: string,
    @Body() period: EmployeePeriodDTO,
  ) {
    return await this.EmployeeService.addPeriodToEmployee(id, period);
  }

  // @PublicAccess()
  /**
   * Eliminar una empleado
   * @param id Identificador de la empleado a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('HUMAN_TALENT', 'ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar un Empleado',
    description: 'Elimina un Empleado según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Empleado a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Empleado eliminado exitosamente',
    type: String,
  })
  public async deleteEmployee(@Param('id') id: string, @Req() req: Request) {
    return await this.EmployeeService.deleteEmployee(id, req.idUser, req.ip);
  }

  // @PublicAccess()
  /**
   * Eliminar un periodo
   * @param id Identificador del periodo a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */
  @Roles('HUMAN_TALENT', 'ADMIN')
  @Delete('period/delete/:id')
  @ApiOperation({
    summary: 'Eliminar un Periodo de empleado',
    description:
      'Elimina un Periodo de empleado según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del Periodo de empleado a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Periodo de empleado eliminado exitosamente',
    type: String,
  })
  public async deletePeriod(@Param('id') id: string) {
    return await this.EmployeeService.deleteEmployeePeriod(id);
  }
}
