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
import { PlanningAdvancedService } from '../services/planning-advanced.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import {
  FindPlanningAdvancedDTO,
  PlanningAdvancedDTO,
  PlanningAdvancedResultDTO,
  PlanningAdvancedUpdateDTO,
} from '../dto/planning-advanced.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators';
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
import { Request } from 'express';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { ValidatePlanningDTO } from '../dto/planning.dto';

@ApiTags('PlanningAdvanced (GESTOR)') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('planning-advanced')
@UseGuards(AuthGuard, RolesGuard)
export class PlanningAdvancedController {
  constructor(
    private readonly planningAdvancedService: PlanningAdvancedService,
  ) {}

  // @PublicAccess()
  /**
   * Registrar PlanningAdvanced
   * @param body Datos de la planificacion a registrar
   * @returns Datos de la planificacion registrado
   */

  @Roles('MANAGER')
  @UseGuards(AuthGuard)
  @Post('register')
  @ApiOperation({
    summary: 'Registrar planificacion',
    description: 'Registra una nueva planificacion',
  })
  @ApiBody({ type: PlanningAdvancedDTO })
  @ApiCreatedResponse({
    description: 'planificacion registrada exitosamente',
    type: PlanningAdvancedDTO,
  })
  public async registerPlanningAdvanced(
    @Req() req: Request,
    @Body() body: PlanningAdvancedDTO,
  ) {
    return await this.planningAdvancedService.createPlanningAdvanced(
      body,
      req.idUser,
    );
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las planificacions
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las planificacions
   * @returns Lista de Tipos de Curso según los parámetros de consulta
   */

  @Roles('MANAGER', 'COORDINATOR')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las planificacions',
    description:
      'Obtiene una lista de todas las Tipos de Curso según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [PlanningAdvancedDTO],
  })
  public async findAllPlanningAdvanced(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return await this.planningAdvancedService.findPlanningAdvanced(
      +page,
      +limit,
      req,
      req.idUser,
    );
  }

  @Get('employee/:id/:start_date/:end_date')
  @ApiOperation({
    summary:
      'Obtener todos las planificaciones de un empleado en un rango de fecha',
    description:
      'Obtiene una lista de todas las planificaciones según los parámetros de consulta',
  })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'start_date' })
  @ApiParam({ name: 'end_date' })
  @ApiOkResponse({
    description: 'Lista de planificaciones',
  })
  public async getEmployeeWeekPlanning(
    @Param('id') id: string,
    @Param('start_date') start_date: string,
    @Param('end_date') end_date: string,
  ) {
    return await this.planningAdvancedService.getEmployeeWeekPlanning(
      id,
      start_date,
      end_date,
    );
  }

  // @PublicAccess()
  /**
   * Obtener una planificacion por su ID
   * @param id ID de la planificacion a obtener
   * @returns planificacion correspondiente al ID proporcionado
   */

  @Get('employee/:id')
  @ApiOperation({
    summary: 'Obtener  la planificacion un empleado',
    description: 'Obtiene la planificacion correspondiente a un empleado',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({
    description: 'planificacion obtenida exitosamente',
    type: [PlanningAdvancedResultDTO],
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la planificacion ',
  })
  public async findOneEmployeePlanning(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.planningAdvancedService.findOneSubordinatePlanning(
      +page,
      +limit,
      id,
    );
  }

  @Roles('MANAGER', 'COORDINATOR')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una planificacion por su ID',
    description: 'Obtiene la planificacion correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la planificacion',
    type: String,
  })
  @ApiOkResponse({
    description: 'planificacion obtenida exitosamente',
    type: PlanningAdvancedDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la planificacion con el ID proporcionado',
  })
  public async findPlanningAdvancedById(@Param('id') id: string) {
    return await this.planningAdvancedService.findPlanningAdvancedById(id);
  }

  /**
   * Buscar un planificacion por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns planificacion que coincide con los parámetros de búsqueda
   */

  @Roles('MANAGER', 'COORDINATOR')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una planificacion por cualquier clave y valor',
    description:
      'Busca una planificacion que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'planificacion encontrado exitosamente',
    type: PlanningAdvancedDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PlanningAdvancedDTO; value: string },
  ) {
    return await this.planningAdvancedService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una planificacion
   * @param id Identificador de la planificacion a actualizar
   * @param body Datos de actualización de la planificacion
   * @returns planificacion actualizado
   */

  @Roles('MANAGER')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una planificacion',
    description:
      'Actualiza una planificacion existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la planificacion a actualizar',
    type: String,
  })
  @ApiBody({
    type: PlanningAdvancedUpdateDTO,
    description: 'Datos de actualización de la planificacion',
  })
  @ApiOkResponse({
    description: 'planificacion actualizada exitosamente',
    type: PlanningAdvancedDTO,
  })
  public async updatePlanningAdvanced(
    @Param('id') id: string,
    @Body() body: PlanningAdvancedUpdateDTO,
  ) {
    return await this.planningAdvancedService.updatePlanningAdvanced(id, body);
  }

  @Patch('validate/many')
  @ApiOperation({
    summary: 'Validar varias planificaciones',
    description:
      'Valida varias planificaciones existentes con los datos proporcionados',
  })
  @ApiBody({ type: ValidatePlanningDTO })
  @ApiOkResponse({
    description: 'planificacion actualizada exitosamente',
  })
  public async validateManyPlannings(@Body() body: ValidatePlanningDTO) {
    return await this.planningAdvancedService.validateManySubordinatesPlanning(
      body,
    );
  }

  @Patch('validate/:id/:status')
  @ApiOperation({
    summary: 'Validar una planificacion',
    description:
      'Valida una planificacion existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la planificacion a actualizar',
    type: String,
  })
  @ApiParam({
    name: 'status',
    description: 'Estado de validacion',
    type: STATUS_IN_PLANNING.VALIDATED || STATUS_IN_PLANNING.INVALIDATED,
  })
  @ApiOkResponse({
    description: 'planificacion actualizada exitosamente',
  })
  public async validatePlanning(
    @Param('id') id: string,
    @Param('status') status: STATUS_IN_PLANNING,
  ) {
    return await this.planningAdvancedService.ValidateSubordinatePlanning(
      id,
      status,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una planificacion
   * @param id Identificador de la planificacion a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('MANAGER')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una planificacion',
    description:
      'Elimina una planificacion según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la planificacion a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'planificacion eliminado exitosamente',
    type: String,
  })
  public async deletePlanningAdvanced(@Param('id') id: string) {
    return await this.planningAdvancedService.deletePlanningAdvanced(id);
  }
}
