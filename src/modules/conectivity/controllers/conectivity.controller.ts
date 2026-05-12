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
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ConectivityService } from '../services/conectivity.service';
import {
  FindConectivityDTO,
  ConectivityDTO,
  ConectivityUpdateDTO,
} from '../dto/conectivity.dto';
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AssignPointDTO } from 'src/modules/points/dto/point.dto';
import { Request } from 'express';

@ApiTags('Conectivity') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('conectivity')
@UseGuards(AuthGuard, RolesGuard)
export class ConectivityController {
  constructor(private readonly ConectivityService: ConectivityService) {}

  // @PublicAccess()
  /**
   * Registrar Conectivity
   * @param body Datos de la conectividad  a registrar
   * @returns Datos de la conectividad  registrado
   */
  @Roles('MONITOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar conectividad ',
    description: 'Registra una nueva conectividad ',
  })
  @ApiBody({
    type: ConectivityDTO,
  })
  @ApiCreatedResponse({
    description: 'conectividad  registrada exitosamente',
    type: ConectivityDTO,
  })
  public async registerConectivity(@Body() body: ConectivityDTO, @Req() req: Request) {
    return await this.ConectivityService.createConectivity(body, req.idUser, req.ip);
  }

  /**
   * Registrar Conectivity a partir de WorkOrder
   * @param body Datos de la punto del encuentro donde se registrara la conectividad
   * @returns Datos de la conectividad  registrado
   */

  @Roles('MONITOR')
  @Post('work-order/:id/register')
  @ApiOperation({
    summary: 'Registrar conectividad a partir de una orden de trabajo ',
    description:
      'Registra una nueva conectividad a partir de una orden de trabajo y un punto de encuentro ',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo a usar ',
    type: String,
  })
  @ApiBody({ type: AssignPointDTO })
  @ApiCreatedResponse({
    description: 'conectividad  registrada exitosamente',
    type: ConectivityDTO,
  })
  public async createConectivityFromWorkOrder(
    @Param('id') id: string,
  ) {
    return await this.ConectivityService.createConectivityFromWorkOrder(
      id,
    );
  }

  @Roles('MONITOR')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos a la conectividad',
    description: 'Sube nuevos archivos a la conectividad',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID de la conectividad ', type: String })
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
    return await this.ConectivityService.addConectivityFiles(id, files);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las conectividades
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las conectividades
   * @returns Lista de conectividades  según los parámetros de consulta
   */

  @Roles('MONITOR', 'TECHNICAL_ASSISTENT')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las conectividades ',
    description:
      'Obtiene una lista de todas las conectividades  según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de conectividades  obtenida exitosamente',
    type: [ConectivityDTO],
  })
  public async findAllConectivity(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.ConectivityService.findConectivity(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una conectividad  por su ID
   * @param id ID de la conectividad  a obtener
   * @returns conectividad  correspondiente al ID proporcionado
   */

  @Roles('MONITOR', 'TECHNICAL_ASSISTENT')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una conectividad  por su ID',
    description: 'Obtiene la conectividad  correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la conectividad ', type: String })
  @ApiOkResponse({
    description: 'conectividad  obtenida exitosamente',
    type: ConectivityDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la conectividad  con el ID proporcionado',
  })
  public async findConectivityById(@Param('id') id: string) {
    return await this.ConectivityService.findConectivityById(id);
  }

  /**
   * Buscar un conectividad  por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns conectividad  que coincide con los parámetros de búsqueda
   */

  @Roles('MONITOR', 'TECHNICAL_ASSISTENT')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una conectividad  por cualquier clave y valor',
    description:
      'Busca una conectividad  que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'conectividad  encontrado exitosamente',
    type: ConectivityDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ConectivityDTO; value: string },
  ) {
    return await this.ConectivityService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una conectividad
   * @param id Identificador de la conectividad  a actualizar
   * @param body Datos de actualización de la conectividad
   * @returns conectividad  actualizado
   */

  @Roles('MONITOR')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una conectividad ',
    description:
      'Actualiza una conectividad  existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del conectividad  se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', required: ['false'] },
        hours: { type: 'number', required: ['false'] },
        min_age: { type: 'number', required: ['false'] },
        max_age: { type: 'number', required: ['false'] },
        content: { type: 'string', required: ['false'] },
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
    description: 'conectividad  registrada exitosamente',
    type: ConectivityDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateConectivity(
    @Param('id') id: string,
    @Body() body: ConectivityUpdateDTO,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.ConectivityService.updateConectivity(id, body, files, req.idUser, req.ip);
  }

  // @PublicAccess()
  /**
   * Eliminar una conectividad
   * @param id Identificador de la conectividad  a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('MONITOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una conectividad ',
    description:
      'Elimina una conectividad  según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la conectividad  a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'conectividad  eliminado exitosamente',
    type: String,
  })
  public async deleteConectivity(@Param('id') id: string, @Req() req: Request) {
    return await this.ConectivityService.deleteConectivity(id, req.idUser, req.ip);
  }
}
