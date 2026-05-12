import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import {
  FindFileDTO,
  FileDTO,
  FileUpdateDTO,
  FileKeyToSearchDTO,
  FileOptionsToDeleteDTO,
} from '../dto/file.dto';

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
import { DeleteResult } from 'typeorm';
import { FILE_ENTITY_NAMES } from 'src/constants/enums';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';

@ApiTags('File') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('file')
@UseGuards(AuthGuard, RolesGuard)
export class FileController {
  constructor(private readonly FileService: FileService) {}

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las instituciones
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las instituciones
   * @returns Lista de instituciones según los parámetros de consulta
   */
  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los Archivos',
    description:
      'Obtiene una lista de todas los Archivos según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Archivos obtenida exitosamente',
    type: [FileDTO],
  })
  public async findAllFile(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.FileService.findFile(+page, +limit, search);
  }

  @Roles(
    'ADMIN',
    'HUMAN_TALENT',
    'COORDINATOR',
    'FACILITATOR',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
  )
  @Get('filter/:entity/:id')
  @ApiOperation({
    summary: 'Obtener todos los Archivos de una entidad',
    description:
      'Obtiene una lista de todas los Archivos de una entidad según los parámetros de consulta',
  })
  @ApiParam({ name: 'entity', enum: FILE_ENTITY_NAMES })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
    description: 'Lista de Archivos obtenida exitosamente',
    type: [FileDTO],
  })
  public async filterByEntity(
    @Param('entity') entity: FILE_ENTITY_NAMES,
    @Param('id') id: string,
  ) {
    return await this.FileService.findByEntityId(id, entity);
  }

  /**
   * Buscar un dirección por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Parroquia que coincide con los parámetros de búsqueda
   */

  @Roles(
    'ADMIN',
    'HUMAN_TALENT',
    'COORDINATOR',
    'FACILITATOR',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
  )
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Archivo por cualquier clave y valor',
    description:
      'Busca una Archivo que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({
    name: 'key',
    description: 'Clave de búsqueda',
    enum: ['fileType', 'fileUrl', 'training'],
  })
  @ApiOkResponse({
    description: 'Archivo encontrado exitosamente',
    type: FileKeyToSearchDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof FileKeyToSearchDTO; value: string },
  ) {
    return await this.FileService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Eliminar una institucion
   * @param id Identificador de la institucion a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles(
    'ADMIN',
    'HUMAN_TALENT',
    'COORDINATOR',
    'FACILITATOR',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
  )
  @Delete('delete/:relationshipName/:valueRelationship')
  public async deleteFiles(
    @Param('relationshipName') relationshipName: string,
    @Param('valueRelationship') valueRelationship: string,
  ): Promise<DeleteResult | undefined> {
    const options: FileOptionsToDeleteDTO = {
      relationshipName,
      valueRelationship,
    };

    return this.FileService.deleteFile(options);
  }

  // @PublicAccess()
  /**
   * Eliminar una institucion
   * @param id Identificador de la institucion a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles(
    'ADMIN',
    'HUMAN_TALENT',
    'COORDINATOR',
    'FACILITATOR',
    'TECHNICAL_ASSISTENT',
    'TECHNICAL_CHIEF',
    'MANAGER',
    'MONITOR',
  )
  @Delete('delete-by-id/:id')
  public async deleteFileById(
    @Param('id') id: string,
  ): Promise<DeleteResult | undefined> {
    return this.FileService.deleteFileById(id);
  }
}
