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
import { VisitTypeService } from '../services/visit-type.service';
import { FindVisitTypeDTO, VisitTypeDTO } from '../dto/visit-type.dto';

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

@ApiTags('VisitType') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('visit-type')
@UseGuards(AuthGuard, RolesGuard)
export class VisitTypeController {
  constructor(private readonly VisitTypeService: VisitTypeService) {}

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los tipos de visita
   
   * @returns Lista de tipos de visita según los parámetros de consulta
   */

    @Roles("ADMIN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los tipos de visita',
    description:
      'Obtiene una lista de todaslos tipos de visita según los parámetros de consulta',
  })
  @ApiOkResponse({
    description: 'Lista de tipos de visita obtenida exitosamente',
    type: [VisitTypeDTO],
  })
  public async findAllVisitType() {
    return await this.VisitTypeService.findVisitType();
  }

  // @PublicAccess()
  /**
   * Obtener una tipos de visita por su ID
   * @param id ID del tipos de visita a obtener
   * @returns tipos de visita correspondiente al ID proporcionado
   */
    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una tipos de visita por su ID',
    description:
      'Obtiene la tipos de visita correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del tipos de visita', type: String })
  @ApiOkResponse({
    description: 'tipos de visita obtenida exitosamente',
    type: VisitTypeDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la tipos de visita con el ID proporcionado',
  })
  public async findVisitTypeById(@Param('id') id: string) {
    return await this.VisitTypeService.findVisitTypeById(id);
  }

  /**
   * Buscar un tipos de visita por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns tipos de visita que coincide con los parámetros de búsqueda
   */
    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una tipos de visita por cualquier clave y valor',
    description:
      'Busca una tipos de visita que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'tipos de visita encontrado exitosamente',
    type: VisitTypeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof VisitTypeDTO; value: string },
  ) {
    return await this.VisitTypeService.findBy({
      key: params.key,
      value: params.value,
    });
  }
}
