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
import { PlanningService } from '../services/planning.service';
import { AuthGuard } from '../../auth/guards/auth.guard';

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
import { FacilitatorPlanningService } from '../services/facilitator-planning.service';
import {
  FacilitatorPlanningDTO,
  FacilitatorPlanningResultDTO,
} from '../dto/facilitator-planning.dto';
import { STATUS_IN_PLANNING } from 'src/constants/enums';
import { ValidatePlanningDTO } from '../dto/planning.dto';

@ApiTags('Planning (FACILITADOR)') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('facilitator-planning')
@UseGuards(AuthGuard, RolesGuard)
export class FacilitatorPlanningController {
  constructor(private readonly planningService: FacilitatorPlanningService) {}

  // @PublicAccess()
  /**
   * Registrar Planning
   * @param body Datos de la planificacion a registrar
   * @returns Datos de la planificacion registrado
   */

  @UseGuards(AuthGuard)
  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar planificacion',
    description: 'Registra una nueva planificacion',
  })
  @ApiBody({ type: FacilitatorPlanningDTO })
  @ApiCreatedResponse({
    description: 'planificacion registrada exitosamente',
    type: FacilitatorPlanningDTO,
  })
  public async registerPlanning(
    @Req() req: Request,
    @Body() body: FacilitatorPlanningDTO,
  ) {
    return await this.planningService.createPlanning(body, req.idUser);
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

  @Roles('FACILITATOR')
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
    type: [FacilitatorPlanningDTO],
  })
  public async findAllPlanning(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return await this.planningService.findPlanning(
      +page,
      +limit,
      req,
      req.idUser,
    );
  }

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
    type: [FacilitatorPlanningResultDTO],
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la planificacion ',
  })
  public async findOneEmployeePlanning(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return await this.planningService.findOneSubordinatePlanning(
      +page,
      +limit,
      id,
    );
  }

  // @PublicAccess()
  /**
   * Obtener una planificacion por su ID
   * @param id ID de la planificacion a obtener
   * @returns planificacion correspondiente al ID proporcionado
   */

  @Roles('FACILITATOR', 'MANAGER')
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
    type: FacilitatorPlanningDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la planificacion con el ID proporcionado',
  })
  public async findPlanningById(@Param('id') id: string) {
    return await this.planningService.findPlanningById(id);
  }

  /**
   * Buscar un planificacion por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns planificacion que coincide con los parámetros de búsqueda
   */

  @Roles('FACILITATOR')
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
    type: FacilitatorPlanningDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof FacilitatorPlanningDTO; value: string },
  ) {
    return await this.planningService.findBy({
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

  @Roles('FACILITATOR')
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
    type: FacilitatorPlanningDTO,
    description: 'Datos de actualización de la planificacion',
  })
  @ApiOkResponse({
    description: 'planificacion actualizada exitosamente',
    type: FacilitatorPlanningDTO,
  })
  public async updatePlanning(
    @Param('id') id: string,
    @Body() body: FacilitatorPlanningDTO,
  ) {
    return await this.planningService.updatePlanning(id, body);
  }

  @Patch('validate/many')
  @ApiOperation({
    summary: 'Validar varias planificaciones',
    description:
      'Valida varias planificaciones existentes con los datos proporcionados',
  })
 @ApiBody({type: ValidatePlanningDTO})
  @ApiOkResponse({
    description: 'planificacion actualizada exitosamente',
  })
  public async validateManyPlannings(
    @Body() body: ValidatePlanningDTO
  ) {
    return await this.planningService.validateManySubordinatesPlanning(body);
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
    return await this.planningService.ValidateSubordinatePlanning(id, status);
  }

  // @PublicAccess()
  /**
   * Eliminar una planificacion
   * @param id Identificador de la planificacion a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('FACILITATOR')
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
  public async deletePlanning(@Param('id') id: string) {
    return await this.planningService.deletePlanning(id);
  }
}
