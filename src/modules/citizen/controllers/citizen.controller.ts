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
  UseGuards,
} from '@nestjs/common';
import { CitizenService } from '../services/citizen.service';
import {
  FindCitizenDTO,
  CitizenDTO,
  CitizenUpdateDTO,
} from '../dto/citizen.dto';

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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Request } from 'express';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { PublicAccess, Roles } from 'src/modules/auth/decorators';

@ApiTags('Citizen') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('citizen')
export class CitizenController {
  constructor(private readonly CitizenService: CitizenService) {}

  // @PublicAccess()
  /**
   * Registrar Citizen
   * @param body Datos del ciudadanos a registrar
   * @returns Datos del ciudadanos registrado
   */

  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar ciudadanos',
    description: 'Registra una nueva ciudadanos',
  })
  @ApiBody({ type: CitizenDTO })
  @ApiCreatedResponse({
    description: 'ciudadanos registrada exitosamente',
    type: CitizenDTO,
  })
  public async registerCitizen(@Body() body: CitizenDTO, @Req() req: Request) {
    await this.CitizenService.validateUniqueValues(body.email, body.id_value);
    return await this.CitizenService.createCitizen(body, req.idUser, req.ip);
  }

  @Roles('FACILITATOR')
  @Post(':id/reset-password')
  @ApiOperation({
    summary: 'Resetea la contraseña de un ciudadano',
    description:
      'Resetea la contraseña de un ciudadano y lo marca en el sistema forzandolo a cambiarla una vez inicie sesion',
  })
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiCreatedResponse({
    description: 'Contraseña generada',
    type: String,
  })
  public async resetCitizenPassword(@Param('id') id: string) {
    return await this.CitizenService.resetCitizenPassword(id);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los ciudadanos
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos ciudadanos
   * @returns Lista de ciudadanos según los parámetros de consulta
   */

  @Roles('FACILITATOR', 'ADMIN')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los ciudadanos',
    description:
      'Obtiene una lista de todas los ciudadanos según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de ciudadanos obtenida exitosamente',
    type: [CitizenDTO],
  })
  public async findAllCitizen(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.CitizenService.findCitizen(+page, +limit, req);
  }

  @Get('login/report/:id')
  @ApiOperation({
    summary: 'Obtener registros de inicio de sesion por su ID del ciudadano',
    description:
      'Obtener registros de inicio de sesion por su ID del ciudadano',
  })
  @ApiParam({ name: 'id', description: 'ID del ciudadanos', type: String })
  @ApiNotFoundResponse({
    description: 'No se encontró la ciudadanos con el ID proporcionado',
  })
  public async getCitizenLoginRecord(@Param('id') id: string, @Query('page') page: string, @Query('limit') limit: string) {
    return await this.CitizenService.getCitizenLoginRecord(id, +page, +limit);
  }

  @Roles('CITIZEN')
  @UseGuards(AuthGuard)
  @Get('courses')
  @ApiOperation({
    summary: 'Obtener todos los cursos del ciudadano',
    description: 'Obtiene una lista de todos los cursos del ciudadano',
  })
  @ApiOkResponse({
    description: 'Lista de ciudadanos obtenida exitosamente',
  })
  public async getEnrolledCourses(@Req() req: Request) {
    return await this.CitizenService.getEnrolledCourses(req.idUser);
  }

  
  

  // @PublicAccess()
  /**
   * Obtener una ciudadanos por su ID
   * @param id ID del ciudadanos a obtener
   * @returns ciudadanos correspondiente al ID proporcionado
   */

  @Roles('FACILITATOR', 'ADMIN')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una ciudadanos por su ID',
    description: 'Obtiene la ciudadanos correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del ciudadanos', type: String })
  @ApiOkResponse({
    description: 'ciudadanos obtenida exitosamente',
    type: CitizenDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la ciudadanos con el ID proporcionado',
  })
  public async findCitizenById(@Param('id') id: string) {
    return await this.CitizenService.findCitizenById(id);
  }

  /**
   * Buscar un ciudadanos por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns ciudadanos que coincide con los parámetros de búsqueda
   */

  @Roles('FACILITATOR', 'ADMIN')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una ciudadanos por cualquier clave y valor',
    description:
      'Busca una ciudadanos que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'ciudadanos encontrado exitosamente',
    type: CitizenDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CitizenDTO; value: string },
  ) {
    return await this.CitizenService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una ciudadanos
   * @param id Identificador del ciudadanos a actualizar
   * @param body Datos de actualización del ciudadanos
   * @returns ciudadanos actualizado
   */

  @Roles('FACILITATOR')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una ciudadanos',
    description:
      'Actualiza una ciudadanos existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del ciudadanos a actualizar',
    type: String,
  })
  @ApiBody({
    type: CitizenUpdateDTO,
    description: 'Datos de actualización del ciudadanos',
  })
  @ApiOkResponse({
    description: 'ciudadanos actualizada exitosamente',
    type: CitizenDTO,
  })
  public async updateCitizen(
    @Param('id') id: string,
    @Body() body: CitizenUpdateDTO,
    @Req() req: Request,
  ) {
    return await this.CitizenService.updateCitizen(
      id,
      body,
      req.idUser,
      req.ip,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una ciudadanos
   * @param id Identificador del ciudadanos a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('FACILITATOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una ciudadanos',
    description: 'Elimina una ciudadanos según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del ciudadanos a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'ciudadanos eliminado exitosamente',
    type: String,
  })
  public async deleteCitizen(@Param('id') id: string, @Req() req: Request) {
    return await this.CitizenService.deleteCitizen(id, req.idUser, req.ip);
  }
}
