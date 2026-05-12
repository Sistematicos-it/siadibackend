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
import { FaceToFaceTrainingService } from '../services/face-to-face-training.service';
import {
  FindFaceToFaceTrainingDTO,
  FaceToFaceTrainingDTO,
  FaceToFaceTrainingUpdateDTO,
} from '../dto/face-to-face-training.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
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

@ApiTags('FaceToFaceTraining') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('face-to-face-training')
@UseGuards(AuthGuard, RolesGuard)
export class FaceToFaceTrainingController {
  constructor(
    private readonly FaceToFaceTrainingService: FaceToFaceTrainingService,
  ) {}

  // @PublicAccess()
  /**
   * Registrar FaceToFaceTraining
   * @param body Datos de la capacitacion presencial a registrar
   * @returns Datos de la capacitacion presencial registrado
   */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar capacitacion presencial',
    description: 'Registra una nueva capacitacion presencial',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        hours: { type: 'number' },
        min_age: { type: 'number' },
        max_age: { type: 'number' },
        content: { type: 'string' },
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
    description: 'capacitacion presencial registrada exitosamente',
    type: FaceToFaceTrainingDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerFaceToFaceTraining(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: FaceToFaceTrainingDTO,
  ) {
    return await this.FaceToFaceTrainingService.createFaceToFaceTraining(
      body,
      files,
    );
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las capacitaciones presencialeses
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las capacitaciones presencialeses
   * @returns Lista de capacitaciones presencialeses según los parámetros de consulta
   */

    @Roles("ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las capacitaciones presencialeses',
    description:
      'Obtiene una lista de todas las capacitaciones presencialeses según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de capacitaciones presencialeses obtenida exitosamente',
    type: [FaceToFaceTrainingDTO],
  })
  public async findAllFaceToFaceTraining(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.FaceToFaceTrainingService.findFaceToFaceTraining(
      +page,
      +limit,
      search,
    );
  }

  // @PublicAccess()
  /**
   * Obtener una capacitacion presencial por su ID
   * @param id ID de la capacitacion presencial a obtener
   * @returns capacitacion presencial correspondiente al ID proporcionado
   */

    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una capacitacion presencial por su ID',
    description:
      'Obtiene la capacitacion presencial correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la capacitacion presencial',
    type: String,
  })
  @ApiOkResponse({
    description: 'capacitacion presencial obtenida exitosamente',
    type: FaceToFaceTrainingDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la capacitacion presencial con el ID proporcionado',
  })
  public async findFaceToFaceTrainingById(@Param('id') id: string) {
    return await this.FaceToFaceTrainingService.findFaceToFaceTrainingById(id);
  }

  /**
   * Buscar un capacitacion presencial por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns capacitacion presencial que coincide con los parámetros de búsqueda
   */

    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una capacitacion presencial por cualquier clave y valor',
    description:
      'Busca una capacitacion presencial que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'capacitacion presencial encontrado exitosamente',
    type: FaceToFaceTrainingDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof FaceToFaceTrainingDTO; value: string },
  ) {
    return await this.FaceToFaceTrainingService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una capacitacion presencial
   * @param id Identificador de la capacitacion presencial a actualizar
   * @param body Datos de actualización de la capacitacion presencial
   * @returns capacitacion presencial actualizado
   */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una capacitacion presencial',
    description:
      'Actualiza una capacitacion presencial existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del capacitacion presencial se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
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
    description: 'capacitacion presencial registrada exitosamente',
    type: FaceToFaceTrainingDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateFaceToFaceTraining(
    @Param('id') id: string,
    @Body() body: FaceToFaceTrainingUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.FaceToFaceTrainingService.updateFaceToFaceTraining(
      id,
      body,
      files,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una capacitacion presencial
   * @param id Identificador de la capacitacion presencial a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una capacitacion presencial',
    description:
      'Elimina una capacitacion presencial según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la capacitacion presencial a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'capacitacion presencial eliminado exitosamente',
    type: String,
  })
  public async deleteFaceToFaceTraining(@Param('id') id: string) {
    return await this.FaceToFaceTrainingService.deleteFaceToFaceTraining(id);
  }
}
