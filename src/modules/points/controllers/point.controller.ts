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
import { PointService } from '../services/point.service';
import {
  AssignCitizenDTO,
  FindPointDTO,
  PointDTO,
  PointUpdateDTO,
} from '../dto/point.dto';

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
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('Point') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('point')
@UseGuards(AuthGuard, RolesGuard)
export class PointController {
  constructor(private readonly PointService: PointService) {}

  // @PublicAccess()
  /**
   * Registrar Point
   * @param body Datos del puntos de encuentro a registrar
   * @returns Datos del puntos de encuentro registrado
   */

  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar puntos de encuentro',
    description: 'Registra una nueva puntos de encuentro',
  })
  @ApiBody({ type: PointDTO })
  @ApiCreatedResponse({
    description: 'puntos de encuentro registrada exitosamente',
    type: PointDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerPoint(
    @Body() body: PointDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.PointService.createPoint(body, files, req.idUser, req.ip);
  }

  @Roles('FACILITATOR')
  @Post('assign-citizen')
  @ApiOperation({
    summary: 'Asignar ciudadano al punto del encuentro',
    description: 'Asignar ciudadano al punto del encuentro',
  })
  @ApiBody({ type: AssignCitizenDTO })
  @ApiCreatedResponse({
    description: 'Ciudadano asignado exitosamente',
  })
  public async assignCitizenToPoint(
    @Body() body: AssignCitizenDTO,
    @Req() req: Request,
  ) {
    return await this.PointService.assignCitizen(req.idUser, body.citizen_id);
  }

  @Roles('ADMIN')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al punto del encuentro',
    description: 'Sube nuevos archivos al punto del encuentro',
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
    return await this.PointService.addFiles(id, files);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los puntos de encuentro
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos puntos de encuentro
   * @returns Lista de puntos de encuentro según los parámetros de consulta
   */

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los puntos de encuentro',
    description:
      'Obtiene una lista de todaslos puntos de encuentro según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de puntos de encuentro obtenida exitosamente',
    type: [PointDTO],
  })
  public async findAllPoint(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.PointService.findPoint(+page, +limit, req);
  }

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get('availability-point')
  @ApiOperation({
    summary: 'Obtener todos los puntos de encuentro',
    description:
      'Obtiene una lista de todaslos puntos de encuentro según los parámetros de consulta',
  })
  @ApiQuery({ name: 'country', type: String, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de puntos de encuentro obtenida exitosamente',
    type: [PointDTO],
  })
  public async getPointCalculationsAvailability(
    @Query('country') country: string,
    @Query('region') region: string,
    @Query('province') province: string,
    @Query('canton') canton: string,
    @Query('parish') parish: string,
    @Query('name') name: string,
    @Req() req: Request,
  ) {
    const filters = {
      country,
      region,
      province,
      canton,
      parish,
      name
    }
    return await this.PointService.getPointCalculationsAvailability(filters);
  }

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get('availability-point-test')
  @ApiOperation({
    summary: 'Obtener todos los puntos de encuentro',
    description:
      'Obtiene una lista de todaslos puntos de encuentro según los parámetros de consulta',
  })
  @ApiQuery({ name: 'country', type: String, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  @ApiQuery({ name: 'name', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de puntos de encuentro obtenida exitosamente',
    type: [PointDTO],
  })
  public async getPointAvailability(
    @Query('country') country: string,
    @Query('region') region: string,
    @Query('province') province: string,
    @Query('canton') canton: string,
    @Query('parish') parish: string,
    @Query('name') name: string,
    @Req() req: Request,
  ) {
    const filters = {
      country,
      region,
      province,
      canton,
      parish,
      name
    }
    return await this.PointService.getPointAvailability(filters);
  }

  @Get('history/report/:id')
  @ApiOperation({
    summary: 'Obtener reporte historico del punto de encuentro por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del puntos de encuentro',
    type: String,
  })
  @ApiOkResponse({
    description: 'reporte obtenida exitosamente',
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la puntos de encuentro con el ID proporcionado',
  })
  public async getPointHistoricalReport(@Param('id') id: string) {
    return await this.PointService.getPointHistoricalReport(id);
  }

  @Get('memory-aid/report/:province_id')
  @ApiOperation({
    summary: 'Obtener reporte historico del punto de encuentro por su ID',
  })
  @ApiParam({
    name: 'province_id',
    description: 'ID de la provincia',
    type: String,
  })
  @ApiQuery({
    name: 'canton_id',
    description: 'id del canton',
    type: String,
    required: false,
  })
  @ApiOkResponse({
    description: 'reporte obtenida exitosamente',
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la puntos de encuentro con el ID proporcionado',
  })
  public async getMemoryAidReport(
    @Param('province_id') id: string,
    @Query('canton_id') canton_id: string,
  ) {
    return await this.PointService.getMemoryAidReport(id, canton_id);
  }

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get('point-assets')
  @ApiOperation({
    summary: 'Obtener los bienes de los puntos de encuentro',
  })
  @ApiQuery({
    name: 'id',
    description: 'ID del puntos de encuentro',
    type: String,
    required: false,
  })
  public async getPointAssets(@Query('id') id: string) {
    return await this.PointService.getPointAssets(id);
  }

  // @PublicAccess()
  /**
   * Obtener una puntos de encuentro por su ID
   * @param id ID del puntos de encuentro a obtener
   * @returns puntos de encuentro correspondiente al ID proporcionado
   */

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una puntos de encuentro por su ID',
    description:
      'Obtiene la puntos de encuentro correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del puntos de encuentro',
    type: String,
  })
  @ApiOkResponse({
    description: 'puntos de encuentro obtenida exitosamente',
    type: PointDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la puntos de encuentro con el ID proporcionado',
  })
  public async findPointById(@Param('id') id: string) {
    return await this.PointService.findPointById(id);
  }

  /**
   * Buscar un puntos de encuentro por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns puntos de encuentro que coincide con los parámetros de búsqueda
   */

  @Roles(
    'ADMIN',
    'MONITOR',
    'MANAGER',
    'FACILITATOR',
    'COORDINATOR',
    'HUMAN_TALENT',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
  )
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una puntos de encuentro por cualquier clave y valor',
    description:
      'Busca una puntos de encuentro que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'puntos de encuentro encontrado exitosamente',
    type: PointDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PointDTO; value: string },
  ) {
    return await this.PointService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una puntos de encuentro
   * @param id Identificador del puntos de encuentro a actualizar
   * @param body Datos de actualización del puntos de encuentro
   * @returns puntos de encuentro actualizado
   */
  @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una puntos de encuentro',
    description:
      'Actualiza una puntos de encuentro existente con los datos proporcionados',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Identificador del puntos de encuentro a actualizar',
    type: String,
  })
  @ApiBody({
    type: PointUpdateDTO,
    description: 'Datos de actualización del puntos de encuentro',
  })
  @ApiOkResponse({
    description: 'puntos de encuentro actualizada exitosamente',
    type: PointDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updatePoint(
    @Param('id') id: string,
    @Body() body: PointUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.PointService.updatePoint(
      id,
      body,
      files,
      req.idUser,
      req.ip,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una puntos de encuentro
   * @param id Identificador del puntos de encuentro a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una puntos de encuentro',
    description:
      'Elimina una puntos de encuentro según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del puntos de encuentro a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'puntos de encuentro eliminado exitosamente',
    type: String,
  })
  public async deletePoint(@Param('id') id: string, @Req() req: Request) {
    return await this.PointService.deletePoint(id, req.idUser, req.ip);
  }
}
