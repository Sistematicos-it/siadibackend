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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import {
  FindCourseDTO,
  CourseDTO,
  CourseUpdateDTO,
  AttendCourseDTO,
} from '../dto/course.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
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
import { DateInterceptor } from '../interceptors/date.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Course') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('course')
@UseGuards(AuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly CourseService: CourseService) {}

  // @PublicAccess()
  /**
   * Registrar Course
   * @param body Datos de la curso a registrar
   * @returns Datos de la curso registrado
   */

  //@UseGuards(AuthGuard)
  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar curso',
    description: 'Registra una nueva curso',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', required: ['true'] },
        start_date: { type: 'date', required: ['true'] },
        end_date: { type: 'date', required: ['true'] },
        week_days_amount: { type: 'string', required: ['false'] },
        observations: { type: 'string', required: ['false'] },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'curso registrada exitosamente',
    type: CourseDTO,
  })
  @UseInterceptors(FileInterceptor('coverImage'))
  public async registerCourse(
    @Req() req: Request,
    @Body() body: CourseDTO,
    @UploadedFile() coverImage: Express.Multer.File,
  ) {
    //const { name } = body;
    //const nameExists = await this.CourseService.checkIfNameExists(name);    
    try{
      return await this.CourseService.createCourse(req.idUser, body, coverImage, req.ip);
    }catch(msg){
      throw new ConflictException(""+msg+"");
    }
    
  }

  @Roles('CITIZEN')
  @UseGuards(AuthGuard)
  @Post('attend')
  @ApiOperation({
    summary: 'Registrar Asistencia a  curso',
    description: 'Registra una nueva Asistencia a un curso',
  })
  @ApiBody({ type: AttendCourseDTO })
  @ApiCreatedResponse({
    description: 'Asistencia registrada exitosamente',
  })
  public async registerCourseAttendance(
    @Req() req: Request,
    @Body() body: AttendCourseDTO,
  ) {
    return await this.CourseService.registerCitizenAttendance(
      req.idUser,
      body.course_id,
    );
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las cursos
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las cursos
   * @returns Lista de Tipos de Curso según los parámetros de consulta
   */
  @Roles('FACILITATOR', 'CITIZEN', 'MANAGER')
  @Get('all')
  @UseInterceptors(DateInterceptor)
  @ApiOperation({
    summary: 'Obtener todos las cursos',
    description:
      'Obtiene una lista de todas las Tipos de Curso según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [CourseDTO],
  })
  public async findAllCourse(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.CourseService.findCourse(+page, +limit, req);
  }

  @Roles('FACILITATOR', 'CITIZEN')
  @UseGuards(AuthGuard)
  @Get('attendances')
  @ApiOperation({
    summary: 'Obtener todas las assitencias de un ciudadano a un curso ',
    description:
      'Obtiene una lista de todas las assitencias de un ciudadano a un curso según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [CourseDTO],
  })
  public async getAttendances(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.CourseService.getCourseAttendaces(
      +page,
      +limit,
      req.idUser,
    );
  }

  @Roles('FACILITATOR')
  @UseGuards(AuthGuard)
  @Get('attendances/:course_id')
  @ApiOperation({
    summary: 'Obtener todos los asistentes y asistencias del curso indicado ',
    description:
      'Obtiene una lista de todos los asistentes con la cantidad de assitencias en el curso indicado',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de asistencias obtenida exitosamente',
    type: [CourseDTO],
  })
  public async getAttendancesByCourse(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
    @Param('course_id') course_id: string,
  ) {
    return await this.CourseService.getCourseAttendacesByCourseId(
      +page,
      +limit,
      course_id,
    );
  }

  @UseGuards(AuthGuard)
  @Get('attended/:course_id')
  @ApiOperation({
    summary: 'Valida si el ciudadano asistio al curso hoy',
    description: 'Valida si el ciudadano asistio al curso hoy',
  })
  @ApiParam({ name: 'course_id', description: 'identificador del curso' })
  @ApiOkResponse({
    description: 'Validacion de asistenca',
    type: Boolean,
  })
  public async getAttendedToday(
    @Req() req: Request,
    @Param('course_id') id: string,
  ) {
    return await this.CourseService.getTodayAttended(req.idUser, id);
  }

  @Roles('FACILITATOR', 'CITIZEN')
  @Get('date/:start_date/:end_date')
  @UseInterceptors(DateInterceptor)
  @ApiOperation({
    summary: 'Obtener todos los cursos en un rango de fechas especifico',
    description:
      'Obtiene una lista de todas las Tipos de Curso según los parámetros de consulta en el rango de fecha',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiParam({ name: 'start_date', type: String, required: true })
  @ApiParam({ name: 'end_date', type: String, required: true })
  @ApiOkResponse({
    description: 'Lista de Tipos de Curso obtenida exitosamente',
    type: [CourseDTO],
  })
  public async filterByDate(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('start_date') start_date: string,
    @Param('end_date') end_date: string,
    @Query('onlyActive') onlyActive: string,
  ) {
    return await this.CourseService.filterByDate(
      +page,
      +limit,
      start_date,
      end_date,
      onlyActive
    );
  }

  // @PublicAccess()
  /**
   * Obtener una curso por su ID
   * @param id ID de la curso a obtener
   * @returns curso correspondiente al ID proporcionado
   */

  @Roles('FACILITATOR', 'CITIZEN',  'MANAGER')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una curso por su ID',
    description: 'Obtiene la curso correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la curso',
    type: String,
  })
  @ApiOkResponse({
    description: 'curso obtenida exitosamente',
    type: CourseDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la curso con el ID proporcionado',
  })
  public async findCourseById(@Param('id') id: string) {
    return await this.CourseService.findCourseById(id);
  }

  /**
   * Buscar un curso por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns curso que coincide con los parámetros de búsqueda
   */

  @Roles('FACILITATOR', 'CITIZEN')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una curso por cualquier clave y valor',
    description: 'Busca una curso que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'curso encontrado exitosamente',
    type: CourseDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CourseDTO; value: string },
  ) {
    return await this.CourseService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una curso
   * @param id Identificador de la curso a actualizar
   * @param body Datos de actualización de la curso
   * @returns curso actualizado
   */

  @Roles('FACILITATOR')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una curso',
    description: 'Actualiza una curso existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la curso a actualizar',
    type: String,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', required: ['true'] },
        start_date: { type: 'date', required: ['true'] },
        end_date: { type: 'date', required: ['true'] },
        week_days_amount: { type: 'string', required: ['false'] },
        observations: { type: 'string', required: ['false'] },
        coverImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'curso actualizada exitosamente',
    type: CourseDTO,
  })
  @UseInterceptors(FileInterceptor('coverImage'))
  public async updateCourse(
    @Param('id') id: string,
    @Body() body: CourseUpdateDTO,
    @Req() req: Request,
    @UploadedFile() coverImage: Express.Multer.File,
  ) {
    // const { name } = body;
    // const nameExists = await this.CourseService.checkIfNameExists(name, id);
    // if (nameExists) {
    //   throw new ConflictException('Ese nombre de curso ya existe');
    // }
    try{
      return await this.CourseService.updateCourse(id, body, coverImage, req.idUser, req.ip);
    }catch(msg){
      throw new ConflictException(""+msg+"");
    }
    
  }

  // @PublicAccess()
  /**
   * Eliminar una curso
   * @param id Identificador de la curso a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('FACILITATOR')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una curso',
    description: 'Elimina una curso según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la curso a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'curso eliminado exitosamente',
    type: String,
  })
  public async deleteCourse(@Param('id') id: string, @Req() req: Request) {
    return await this.CourseService.deleteCourse(id, req.idUser, req.ip);
  }
}
