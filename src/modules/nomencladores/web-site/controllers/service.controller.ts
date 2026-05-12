import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import {
  FindServiceDTO,
  ServiceDTO,
  ServiceSwaggerDTO,
  ServiceUpdateDTO,
} from '../dto/service.dto';
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
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Request } from 'express';
import { ROLES } from 'src/constants';
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { VisitRecordDTO } from 'src/modules/visit-record/dto/visit-record.dto';
import { VISIT_TYPES } from 'src/constants/visit-types';
import { VisitRecordService } from 'src/modules/visit-record/services/visit-record.service';

@ApiTags('Service') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('service')
@UseGuards(AuthGuard, RolesGuard)
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly CitizenService: CitizenService,
    private readonly VisitService: VisitRecordService,
  ) {}

  // @PublicAccess()
  /**
   * Registrar Service
   * @param body Datos de la dirección a registrar
   * @returns Datos de la dirección registrado
   */

  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Servicio',
    description: 'Registra una nueva Servicio',
  })
  // @ApiBody({ type: ServiceSwaggerDTO })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        url: { type: 'string' },
        categorie: { type: 'uuid' },
        image: {
          type: 'string',
          format: 'binary',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Servicio registrada exitosamente',
    type: ServiceDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async registerService(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ServiceDTO,
  ) {
    const { name } = body;
    const nameExists = await this.serviceService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de servicio ya existe');
    }
    const image = files.find((file) => file.fieldname === 'image');
    const coverImage = files.find((file) => file.fieldname === 'coverImage');
    return await this.serviceService.createService(body, image, coverImage);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las Direcciones
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Direcciones
   * @returns Lista de Direcciones según los parámetros de consulta
   */

  @PublicAccess()
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Servicioes',
    description:
      'Obtiene una lista de todas las Servicioes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Servicioes obtenida exitosamente',
    type: [ServiceDTO],
  })
  public async findAllService(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('category') category: string,
  ) {
    const filters = {
      category,
    };
    return await this.serviceService.findService(
      +page,
      +limit,
      search,
      filters,
    );
  }

  // @PublicAccess()
  /**
   * Obtener una dirección por su ID
   * @param id ID de la dirección a obtener
   * @returns Parroquia correspondiente al ID proporcionado
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Servicio por su ID',
    description: 'Obtiene la Servicio correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Servicio', type: String })
  @ApiOkResponse({
    description: 'Servicio obtenida exitosamente',
    type: ServiceDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Servicio con el ID proporcionado',
  })
  public async findServiceById(@Param('id') id: string, @Req() req: Request) {
    if (req.roleUser === ROLES.CITIZEN) {
      const citizen = await this.CitizenService.findByUserId(req.idUser);

      if (citizen) {
        const visit: Partial<VisitRecordDTO> = {
          citizen: citizen,
          date: new Date(),
          visit_type: VISIT_TYPES.VISIT,
          point: citizen?.point
        };
        await this.VisitService.createVisitRecord(visit);
      }
    }

    return await this.serviceService.findServiceById(id);
  }

  /**
   * Buscar un dirección por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Parroquia que coincide con los parámetros de búsqueda
   */
  @PublicAccess()
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Servicio por cualquier clave y valor',
    description:
      'Busca una Servicio que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Servicio encontrado exitosamente',
    type: ServiceDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ServiceDTO; value: string },
  ) {
    return await this.serviceService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una dirección
   * @param id Identificador de la dirección a actualizar
   * @param body Datos de actualización de la dirección
   * @returns Parroquia actualizado
   */
  @Roles('ADMIN')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Servicio',
    description:
      'Actualiza una Servicio existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Servicio a actualizar',
    type: String,
  })
  // @ApiBody({ type: ServiceUpdateDTO, description: 'Datos de actualización de la Servicio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', required: ['false'] },
        description: { type: 'string', required: ['false'] },
        url: { type: 'string' },
        categorie: { type: 'uuid' },
        image: {
          type: 'string',
          format: 'binary',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Servicio actualizada exitosamente',
    type: ServiceDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async updateService(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: ServiceUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.serviceService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de servicio ya existe');
    }
    const image = files.find((file) => file.fieldname === 'image');
    const coverImage = files.find((file) => file.fieldname === 'coverImage');
    return await this.serviceService.updateService(id, body, image, coverImage);
  }

  // @PublicAccess()
  /**
   * Eliminar una dirección
   * @param id Identificador de la dirección a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Servicio',
    description: 'Elimina una Servicio según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Servicio a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Servicio eliminado exitosamente',
    type: String,
  })
  public async deleteService(@Param('id') id: string) {
    return await this.serviceService.deleteService(id);
  }
}
