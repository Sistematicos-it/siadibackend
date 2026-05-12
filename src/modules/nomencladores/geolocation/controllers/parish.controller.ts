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
  UseGuards,
} from '@nestjs/common';
import { ParishService } from '../services/parish.service';
import { FindParishDTO, ParishDTO, ParishUpdateDTO } from '../dto/parish.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Parishes') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('parish')
@UseGuards(AuthGuard, RolesGuard)
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  // @PublicAccess()
  /**
 * Registrar parish
 * @param body Datos de la parroquia a registrar
 * @returns Datos de la parroquia registrado
 */

  @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar parroquia',
    description: 'Registra un nueva parroquia',
  })
  @ApiBody({ type: ParishDTO })
  @ApiCreatedResponse({
    description: 'Parroquia registrado exitosamente',
    type: ParishDTO,
  })
  public async registerParish(@Body() body: ParishDTO) {  
    const parroquia = body.name;
    const canton  = body.canton;
    const nameExists = await this.parishService.checkIfParishExists(parroquia, canton);

    if (nameExists) {
      throw new ConflictException('Parroquia ya existe para el cantón escogido');
    }  
    return await this.parishService.createParish(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
 * Obtener todos las Parroquias
 * @param page Número de página para paginación
 * @param limit Cantidad de registros por página
 * @param search Cadena de búsqueda para filtrar las Parroquias
 * @returns Lista de Parroquias según los parámetros de consulta
 */

    @Roles('TECHNICAL_ASSISTENT',
    'FACILITATOR',
    'HUMAN_TALENT',
    'COORDINATOR',
    'MANAGER',
    'TECHNICAL_CHIEF',
    'MONITOR',
    'ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Parroquias',
    description: 'Obtiene una lista de todas las Parroquias según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'detail', type: Boolean, required: false })
  @ApiOkResponse({
    description: 'Lista de Parroquias obtenida exitosamente',
    type: [ParishDTO],
  })
  public async findAllParish(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('detail') detail: string,
    @Req() req: Request
  ) {    
    return await this.parishService.findParish(page, limit, search, detail, req);
  }


  // @PublicAccess()
  /**
 * Obtener una parroquia por su ID
 * @param id ID de la parroquia a obtener
 * @returns Parroquia correspondiente al ID proporcionado
 */

    @Roles("ADMIN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una parroquia por su ID',
    description: 'Obtiene la parroquia correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la parroquia', type: String })
  @ApiOkResponse({
    description: 'Parroquia obtenida exitosamente',
    type: ParishDTO,
  })
  @ApiNotFoundResponse({ description: 'No se encontró la Parroquia con el ID proporcionado' })
  public async findParishById(@Param('id') id: string) {
    return await this.parishService.findParishById(id);
  }


  /**
 * Buscar un parroquia por cualquier clave y valor
 * @param params Parámetros de búsqueda: clave y valor
 * @returns Parroquia que coincide con los parámetros de búsqueda
 */

    @Roles("ADMIN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una parroquia por cualquier clave y valor',
    description: 'Busca una parroquia que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Parroquia encontrado exitosamente',
    type: ParishDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ParishDTO; value: string },
  ) {
    
    return await this.parishService.findBy({
      key: params.key,
      value: params.value,
    });
  }


  // @PublicAccess()
  /**
 * Actualizar una parroquia
 * @param id Identificador de la parroquia a actualizar
 * @param body Datos de actualización de la parroquia
 * @returns Parroquia actualizado
 */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una parroquia',
    description: 'Actualiza una parroquia existente con los datos proporcionados',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la parroquia a actualizar', type: String })
  @ApiBody({ type: ParishUpdateDTO, description: 'Datos de actualización de la parroquia' })
  @ApiOkResponse({
    description: 'Parroquia actualizada exitosamente',
    type: ParishDTO,
  })
  public async updateParish(
    @Param('id') id: string, @Body() body: ParishUpdateDTO,
  ) {
    const name  = body.name;
    const canton = body.canton;
    const nameExists = await this.parishService.checkIfParishExists(name, canton, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de parroquia ya existe');
    }
    return await this.parishService.updateParish(id, body);
  }

  // @PublicAccess()
  /**
 * Eliminar una parroquia
 * @param id Identificador de la parroquia a eliminar
 * @returns Mensaje de éxito en caso de eliminación exitosa
 */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una parroquia',
    description: 'Elimina una parroquia según el identificador proporcionado',
  })
  @ApiParam({ name: 'id', description: 'Identificador de la parroquia a eliminar', type: String })
  @ApiOkResponse({
    description: 'Parroquia eliminado exitosamente',
    type: String,
  })
  public async deleteParish(@Param('id') id: string) {
    return await this.parishService.deleteParish(id);
  }
}
