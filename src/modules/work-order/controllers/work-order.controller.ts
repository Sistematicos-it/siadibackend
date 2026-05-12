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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkOrderService } from '../services/work-order.service';
import {
  FindWorkOrderDTO,
  WorkOrderDTO,
  WorkOrderUpdateDTO,
} from '../dto/work-order.dto';

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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('WorkOrder') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('workOrder')
@UseGuards(AuthGuard, RolesGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  // @PublicAccess()
  /**
   * Registrar WorkOrder
   * @param body Datos de la orden de trabajo a registrar
   * @returns Datos de la orden de trabajo registrado
   */

  @Roles('TECHNICAL_CHIEF', 'MONITOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar orden de trabajo',
    description: 'Registra una nueva orden de trabajo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', required: ['true'] },
        date: { type: 'number', required: ['false'] },
        pointName: { type: 'number', required: ['false'] },
        downloadLink: { type: 'number', required: ['false'] },
        uploadLink: { type: 'string', required: ['false'] },
        availability: { type: 'string', required: ['false'] },
        installationCost: { type: 'string', required: ['false'] },
        monthlyValue: { type: 'string', required: ['false'] },
        address: { type: 'string', required: ['true'] },
        beneficiary: { type: 'string', required: ['true'] },
        zoneCoordinator: { type: 'string', required: ['true'] },
        applicant: { type: 'string', required: ['true'] },
        authorizer: { type: 'string', required: ['true'] },
        technology: { type: 'string', required: ['true'] },
        sharing: { type: 'string', required: ['true'] },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          required: ['false'],
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'orden de trabajo registrada exitosamente',
    type: WorkOrderDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerWorkOrder(
    @Body() body: WorkOrderDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    return await this.workOrderService.createWorkOrder(body, files, req.idUser, req.ip);
  }

  @Roles('TECHNICAL_CHIEF', 'MONITOR')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al workOrder',
    description: 'Sube nuevos archivos al workOrder',
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
    return await this.workOrderService.addFiles(id, files);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las ordenes de trabajo
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las ordenes de trabajo
   * @returns Lista de ordenes de trabajo según los parámetros de consulta
   */

  @Roles('TECHNICAL_CHIEF', 'TECHNICAL_ASSISTENT', 'MONITOR')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las ordenes de trabajo',
    description:
      'Obtiene una lista de todas las ordenes de trabajo según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de ordenes de trabajo obtenida exitosamente',
    type: [WorkOrderDTO],
  })
  public async findAllWorkOrder(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.workOrderService.findWorkOrder(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una orden de trabajo por su ID
   * @param id ID de la orden de trabajo a obtener
   * @returns orden de trabajo correspondiente al ID proporcionado
   */

  @Roles('TECHNICAL_CHIEF', 'TECHNICAL_ASSISTENT', 'MONITOR')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una orden de trabajo por su ID',
    description:
      'Obtiene la orden de trabajo correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo',
    type: String,
  })
  @ApiOkResponse({
    description: 'orden de trabajo obtenida exitosamente',
    type: WorkOrderDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la orden de trabajo con el ID proporcionado',
  })
  public async findWorkOrderById(@Param('id') id: string) {
    return await this.workOrderService.findWorkOrderById(id);
  }

  /**
   * Buscar un orden de trabajo por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns orden de trabajo que coincide con los parámetros de búsqueda
   */

  @Roles('TECHNICAL_CHIEF', 'TECHNICAL_ASSISTENT', 'MONITOR')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una orden de trabajo por cualquier clave y valor',
    description:
      'Busca una orden de trabajo que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'orden de trabajo encontrado exitosamente',
    type: WorkOrderDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof WorkOrderDTO; value: string },
  ) {
    return await this.workOrderService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una orden de trabajo
   * @param id Identificador de la orden de trabajo a actualizar
   * @param body Datos de actualización de la orden de trabajo
   * @returns orden de trabajo actualizado
   */

  @Roles('TECHNICAL_CHIEF', 'MONITOR')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una orden de trabajo',
    description:
      'Actualiza una orden de trabajo existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la orden de trabajo a actualizar',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', required: ['true'] },
        date: { type: 'number', required: ['false'] },
        pointName: { type: 'number', required: ['false'] },
        downloadLink: { type: 'number', required: ['false'] },
        uploadLink: { type: 'string', required: ['false'] },
        availability: { type: 'string', required: ['false'] },
        installationCost: { type: 'string', required: ['false'] },
        monthlyValue: { type: 'string', required: ['false'] },
        address: { type: 'string', required: ['true'] },
        beneficiary: { type: 'string', required: ['true'] },
        zoneCoordinator: { type: 'string', required: ['true'] },
        applicant: { type: 'string', required: ['true'] },
        authorizer: { type: 'string', required: ['true'] },
        technology: { type: 'string', required: ['true'] },
        sharing: { type: 'string', required: ['true'] },
        
      },
    },
  })
  @ApiOkResponse({
    description: 'orden de trabajo actualizada exitosamente',
    type: WorkOrderDTO,
  })
  public async updateWorkOrder(
    @Param('id') id: string,
    @Body() body: WorkOrderUpdateDTO,
    @Req() req: Request
  ) {
    return await this.workOrderService.updateWorkOrder(id, body, req.idUser, req.ip);
  }

  // @PublicAccess()
  /**
   * Eliminar una orden de trabajo
   * @param id Identificador de la orden de trabajo a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('TECHNICAL_CHIEF', 'MONITOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una orden de trabajo',
    description:
      'Elimina una orden de trabajo según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la orden de trabajo a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'orden de trabajo eliminado exitosamente',
    type: String,
  })
  public async deleteWorkOrder(@Param('id') id: string, @Req() req: Request) {
    return await this.workOrderService.deleteWorkOrder(id, req.idUser, req.ip);
  }
}
