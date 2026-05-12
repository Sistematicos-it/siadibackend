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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GlossaryService } from '../services/glossary.service';
import { FindGlossaryDTO, GlossaryDTO, GlossarySwaggerDTO, GlossaryUpdateDTO } from '../dto/glossary.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Glossary') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('glossary')
@UseGuards(AuthGuard, RolesGuard)
export class GlossaryController {
  constructor(private readonly GlossaryService: GlossaryService) {}

  // @PublicAccess()
  /**
 * Registrar Glossary
 * @param body Datos de la dirección a registrar
 * @returns Datos de la dirección registrado
 */

    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Glosario',
    description: 'Registra una nueva Glosario',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: GlossarySwaggerDTO })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Glosario registrada exitosamente',
    type: GlossaryDTO,
  })
  @UseInterceptors(FileInterceptor('image'))
  public async registerGlossary(@UploadedFile() image: Express.Multer.File, @Body() body: GlossaryDTO) { 
    const { name } = body;
    const nameExists = await this.GlossaryService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de glosario ya existe');
    }
       
    return await this.GlossaryService.createGlossary(body, image);
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
    summary: 'Obtener todos las Glosarioes',
    description: 'Obtiene una lista de todas las Glosarioes según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Glosarioes obtenida exitosamente',
    type: [GlossaryDTO],
  })
  public async findAllGlossary(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return await this.GlossaryService.findGlossary(+page, +limit, search);
  }


  // @PublicAccess()
  /**
 * Obtener una dirección por su ID
 * @param id ID de la dirección a obtener
 * @returns Parroquia correspondiente al ID proporcionado
 */

    @PublicAccess()
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Glosario por su ID',
    description: 'Obtiene la Glosario correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la Glosario', type: String })
  @ApiOkResponse({
    description: 'Glosario obtenida exitosamente',
    type: GlossaryDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Glosario con el ID proporcionado' })
  public async findGlossaryById(@Param('id') id: string) {
    return await this.GlossaryService.findGlossaryById(id);
  }


  /**
 * Buscar un dirección por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

    @PublicAccess()
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Glosario por cualquier clave y valor',
    description: 'Busca una Glosario que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Glosario encontrado exitosamente',
    type: GlossaryDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof GlossaryDTO; value: string },
  ) {
    
    return await this.GlossaryService.findBy({
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

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Glosario',
    description: 'Actualiza una Glosario existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Glosario a actualizar', type: String })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: GlossaryUpdateDTO, description: 'Datos de actualización de la Glosario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string',required: ['false'] },
        description: { type: 'string', required: ['false'] },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Glosario actualizada exitosamente',
    type: GlossaryDTO,
  })
  @UseInterceptors(FileInterceptor('image'))
  public async updateGlossary(
    @Param('id') id: string,
    @Body() body: GlossaryUpdateDTO,
    @UploadedFile() image: Express.Multer.File
  ) {
    const { name } = body;
    const nameExists = await this.GlossaryService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de glosario ya existe');
    }
    return await this.GlossaryService.updateGlossary(id, body, image);
  }

  // @PublicAccess()
  /**
 * Eliminar una dirección
 * @param id Identificador de la dirección a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Glosario',
    description: 'Elimina una Glosario según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la Glosario a eliminar', type: String })
  @ApiOkResponse({
    description: 'Glosario eliminado exitosamente',
    type: String,
  })
  public async deleteGlossary(@Param('id') id: string) {
    return await this.GlossaryService.deleteGlossary(id);
  }
}
