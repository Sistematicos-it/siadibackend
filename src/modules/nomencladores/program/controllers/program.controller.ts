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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProgramService } from '../services/program.service';
import {
  FindProgramDTO,
  ProgramDTO,
  ProgramUpdateDTO,
} from '../dto/program.dto';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
import { Request } from 'express';
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
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ROLES } from 'src/constants';
import { VisitRecordService } from 'src/modules/visit-record/services/visit-record.service'
import { CitizenService } from 'src/modules/citizen/services/citizen.service';
import { VISIT_TYPES } from 'src/constants/visit-types';

@ApiTags('Program') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('program')
@UseGuards(AuthGuard, RolesGuard)
export class ProgramController {
  constructor(
    private readonly ProgramService: ProgramService,
    private readonly VisitRecordService: VisitRecordService,
    private readonly CitizenService: CitizenService,
    
  ) {}

  // @Roles("CITIZEN")
  /**
   * Registrar Program
   * @param body Datos de la programa a registrar
   * @returns Datos de la programa registrado
   */

  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar programa',
    description: 'Registra una nueva programa',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProgramDTO })
  @ApiCreatedResponse({
    description: 'programa registrada exitosamente',
    type: ProgramDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async registerProgram(
    @Body() body: ProgramDTO,
    @Req() req: Request,
    @UploadedFiles() listFiles: Array<Express.Multer.File>,
  ) {
    const files: Express.Multer.File[] = listFiles.filter(
      (item) => item.fieldname === 'files',
    );
    const coverImage: Express.Multer.File = listFiles.find(
      (item) => item.fieldname === 'coverImage',
    );
    return await this.ProgramService.createProgram(body, files, coverImage, req.idUser, req.ip);
  }

  // @UploadedFiles() files: Express.Multer.File[],
  // @UploadedFile() coverImage: Express.Multer.File,

  @Roles('ADMIN')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al programa',
    description: 'Sube nuevos archivos al programa',
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
    return await this.ProgramService.addFiles(id, files);
  }

  // @Roles('ADMIN')
  // @Roles("CITIZEN")
  /**
   * Obtener todos las programases
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las programases
   * @returns Lista de programases según los parámetros de consulta
   */

  @Roles('CITIZEN', 'ADMIN', 'FACILITATOR', "MANAGER")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las programases',
    description:
      'Obtiene una lista de todas las programases según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de programases obtenida exitosamente',
    type: [ProgramDTO],
  })
  public async findAllProgram(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.ProgramService.findProgram(+page, +limit, req);
  }

  // @Roles("CITIZEN")
  /**
   * Obtener una programa por su ID
   * @param id ID de la programa a obtener
   * @returns programa correspondiente al ID proporcionado
   */

  @Roles('CITIZEN', 'ADMIN', 'FACILITATOR')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una programa por su ID',
    description: 'Obtiene la programa correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la programa', type: String })
  @ApiOkResponse({
    description: 'programa obtenida exitosamente',
    type: ProgramDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la programa con el ID proporcionado',
  })
  public async findProgramById(@Param('id') id: string, @Req() req: Request) {
    if (req.roleUser === ROLES.CITIZEN) {
      const citizen = await this.CitizenService.findByUserId(req.idUser);
      await this.VisitRecordService.createVisitRecord({
        citizen: citizen,
        date: new Date(),
        visit_type: VISIT_TYPES.VIRTUAL,
        point: citizen.point,
      });
    }

    return await this.ProgramService.findProgramById(id);
  }

  @Roles('CITIZEN', 'ADMIN', 'FACILITATOR')
  @Get('certificate/:id')
  @ApiOperation({
    summary: 'Obtener todos las Programas',
    description:
      'Obtiene una lista de todas las Programas según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de Programas obtenida exitosamente',
    type: [ProgramDTO],
  })
  public async filterProgramByCertificate(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') id: string,
  ) {
    return await this.ProgramService.filterProgramByCertificate(
      +page,
      +limit,
      id,
    );
  }

  /**
   * Buscar un programa por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns programa que coincide con los parámetros de búsqueda
   */

  @Roles('CITIZEN', 'ADMIN', 'FACILITATOR')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una programa por cualquier clave y valor',
    description:
      'Busca una programa que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'programa encontrado exitosamente',
    type: ProgramDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof ProgramDTO; value: string },
  ) {
    return await this.ProgramService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @Roles("CITIZEN")
  /**
   * Actualizar una programa
   * @param id Identificador de la programa a actualizar
   * @param body Datos de actualización de la programa
   * @returns programa actualizado
   */

  @Roles('ADMIN')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una programa',
    description:
      'Actualiza una programa existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del programa se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Identificador del programa a actualizar',
    type: String,
  })
  @ApiBody({
    type: ProgramUpdateDTO,
    description: 'Datos de actualización de la programa',
  })
  @ApiOkResponse({
    description: 'programa actualizado exitosamente',
    type: ProgramDTO,
  })
  @UseInterceptors(AnyFilesInterceptor())
  public async updateProgram(
    @Param('id') id: string,
    @Body() body: ProgramUpdateDTO,
    @UploadedFiles() listFiles: Array<Express.Multer.File>,
    @Req() req: Request
  ) {
    const files: Express.Multer.File[] = listFiles.filter(
      (item) => item.fieldname === 'files',
    );
    const coverImage: Express.Multer.File = listFiles.find(
      (item) => item.fieldname === 'coverImage',
    );
    return await this.ProgramService.updateProgram(id, body, files, coverImage, req.idUser, req.ip);
  }

  // @Roles("CITIZEN")
  /**
   * Eliminar una programa
   * @param id Identificador de la programa a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una programa',
    description: 'Elimina una programa según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la programa a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'programa eliminado exitosamente',
    type: String,
  })
  public async deleteProgram(@Param('id') id: string, @Req() req: Request) {
    return await this.ProgramService.deleteProgram(id, req.idUser, req.ip);
  }
}
