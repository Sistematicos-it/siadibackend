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
import { PermissionRequestService } from '../services/permission-request.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import {
  FindPermissionRequestDTO,
  PermissionRequestDTO,
  PermissionRequestUpdateDTO,
  ValidatePermissionDTO,
} from '../dto/permission-request.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
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
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PERMISSION_REQUEST_STATUS, UNIT_OF_TIME } from 'src/constants/enums';

@ApiTags('PermissionRequest') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('permission-request')
@UseGuards(AuthGuard, RolesGuard)
export class PermissionRequestController {
  constructor(
    private readonly permissionRequestService: PermissionRequestService,
  ) {}

  // @PublicAccess()
  /**
   * Registrar Permission
   * @param body Datos de la solicitud de permiso a registrar
   * @returns Datos de la solicitud de permiso registrado
   */

  @UseGuards(AuthGuard)
  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Post('register')
  @ApiOperation({
    summary: 'Registrar solicitud de permiso',
    description: 'Registra una nueva solicitud de permiso',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionType: { type: 'string', required: ['false'] },
        start_date: { type: 'Date', required: ['false'] },
        end_date: { type: 'Date', required: ['false'] },
        time: { type: 'number', required: ['false'] },
        unitTime: {
          type: 'enum',
          enum: ['Horas', 'Dias', 'Meses'],
          required: ['false'],
        },
        observation: { type: 'number', required: ['false'] },
        status: {
          type: 'enum',
          enum: ['Borrador', 'Solicitado', 'Aceptado'],
          required: ['false'],
        },
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
    description: 'solicitud de permiso registrada exitosamente',
    type: PermissionRequestDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerPermission(
    @Body() body: PermissionRequestDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.permissionRequestService.createPermission(
      body,
      files,
      req,
    );
  }

  @Post('validate/:id')
  @ApiOperation({
    summary: 'Validar Permission Request',
    description: 'Validar Permission Request',
  })
  @ApiBody({
    type: ValidatePermissionDTO,
  })
  public async validatePermission(
    @Param('id') id: string,
    @Body() body: ValidatePermissionDTO,
  ) {
    return await this.permissionRequestService.validatePermission(
      id,
      body.status,
    );
  }

  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al PermissionRequest',
    description: 'Sube nuevos archivos al PermissionRequest',
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
    return await this.permissionRequestService.addFiles(id, files);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las solicitud de permisos
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las solicitud de permisos
   * @returns Lista de Tipos de Curso según los parámetros de consulta
   */

  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las solicitud de permisos',
    description:
      'Obtiene una lista de todas las Tipos de Curso según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [PermissionRequestDTO],
  })
  public async findAllPermission(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.permissionRequestService.findPermission(
      +page,
      +limit,
      req,
    );
  }

  @Get('user/:id')
  @ApiOperation({
    summary: 'Obtener todos las solicitud de permisos',
    description:
      'Obtiene una lista de todas las Tipos de Curso según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [PermissionRequestDTO],
  })
  public async findUserPermissions(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return await this.permissionRequestService.getUserPermissions(
      +page,
      +limit,
      id,
      req
    );
  }

  // @PublicAccess()
  /**
   * Obtener una solicitud de permiso por su ID
   * @param id ID de la solicitud de permiso a obtener
   * @returns solicitud de permiso correspondiente al ID proporcionado
   */
  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una solicitud de permiso por su ID',
    description:
      'Obtiene la solicitud de permiso correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud de permiso',
    type: String,
  })
  @ApiOkResponse({
    description: 'solicitud de permiso obtenida exitosamente',
    type: PermissionRequestDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la solicitud de permiso con el ID proporcionado',
  })
  public async findPermissionById(@Param('id') id: string) {
    return await this.permissionRequestService.findPermissionById(id);
  }

  /**
   * Buscar un solicitud de permiso por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns solicitud de permiso que coincide con los parámetros de búsqueda
   */

  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una solicitud de permiso por cualquier clave y valor',
    description:
      'Busca una solicitud de permiso que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'solicitud de permiso encontrado exitosamente',
    type: PermissionRequestDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof PermissionRequestDTO; value: string },
  ) {
    return await this.permissionRequestService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una solicitud de permiso
   * @param id Identificador de la solicitud de permiso a actualizar
   * @param body Datos de actualización de la solicitud de permiso
   * @returns solicitud de permiso actualizado
   */

  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una solicitud de permiso',
    description:
      'Actualiza una solicitud de permiso existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la solicitud de permiso a actualizar',
    type: String,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionType: { type: 'string', required: ['false'] },
        start_date: { type: 'Date', required: ['false'] },
        end_date: { type: 'Date', required: ['false'] },
        time: { type: 'number', required: ['false'] },
        unitTime: {
          type: 'enum',
          enum: ['Horas', 'Dias', 'Meses'],
          required: ['false'],
        },
        observation: { type: 'number', required: ['false'] },
        status: {
          type: 'enum',
          enum: ['Borrador', 'Solicitado', 'Aceptado'],
          required: ['false'],
        },
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
  @ApiOkResponse({
    description: 'solicitud de permiso actualizada exitosamente',
    type: PermissionRequestDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updatePermission(
    @Param('id') id: string,
    @Body() body: PermissionRequestUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.permissionRequestService.updatePermission(
      id,
      body,
      files,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una solicitud de permiso
   * @param id Identificador de la solicitud de permiso a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles(
    'ADMIN',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
    'COORDINATOR',
    'FACILITATOR',
    'HUMAN_TALENT',
  )
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una solicitud de permiso',
    description:
      'Elimina una solicitud de permiso según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la solicitud de permiso a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'solicitud de permiso eliminado exitosamente',
    type: String,
  })
  public async deletePermission(@Param('id') id: string) {
    return await this.permissionRequestService.deletePermission(id);
  }
}
