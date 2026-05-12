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
  import { CourseCatalogService } from '../services/course-catalog.service'
  import { CourseCatalogDTO, CourseCatalogSwaggerDTO, CourseCatalogUpdateDTO } from '../dto/course-catalog.dto';
  import { PublicAccess } from '../../../auth/decorators/public.decorator';
  import { AuthGuard } from '../../../auth/guards/auth.guard';
  import { RolesGuard } from '../../../auth/guards/roles.guard';
  import { Roles } from '../../../auth/decorators';
  import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { FileInterceptor } from '@nestjs/platform-express';
  
  @ApiTags('CourseCatalog') // Esto lo que hace es separar los endpoint en swagger por Tags
  @Controller('course-catalog')
  @UseGuards(AuthGuard, RolesGuard)
  export class CourseCatalogController {
    constructor(private readonly CourseCatalogService: CourseCatalogService) {}
  
    // @PublicAccess()
    /**
   * Registrar CourseCatalog
   * @param body Datos de la dirección a registrar
   * @returns Datos de la dirección registrado
   */
  
    @Roles("ADMIN")
    @Post('register')
    @ApiOperation({
      summary: 'Registrar Curso',
      description: 'Registra una nueva Curso',
    })
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiBody({ type: CourseCatalogSwaggerDTO })
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
      description: 'Catálogo Curso registrada exitosamente',
      type: CourseCatalogDTO,
    })
    @UseInterceptors(FileInterceptor('image'))
    public async registerCourseCatalog(@UploadedFile() image: Express.Multer.File, @Body() body: CourseCatalogDTO) { 
      const { name } = body;
      const nameExists = await this.CourseCatalogService.checkIfNameExists(name);
  
      if (nameExists) {
        throw new ConflictException('Ese nombre de Catálogo Curso ya existe');
      }
         
      return await this.CourseCatalogService.createCourseCatalog(body, image);
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
      summary: 'Obtener todos las Catálogo Cursos',
      description: 'Obtiene una lista de todo el catálogo de cursos es según los parámetros de consulta',
    })
    @ApiQuery({ name: 'page', type: Number, required: false })
    @ApiQuery({ name: 'limit', type: Number, required: false })
    @ApiQuery({ name: 'search', type: String, required: false })
    @ApiOkResponse({
      description: 'Lista de catálogo de cursos obtenida exitosamente',
      type: [CourseCatalogDTO],
    })
    public async findAllCourseCatalog(
      @Query('page') page: number,
      @Query('limit') limit: number,
      @Query('search') search: string,
    ) {
      return await this.CourseCatalogService.findCourseCatalog(+page, +limit, search);
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
      summary: 'Obtener una Catálogo Curso por su ID',
      description: 'Obtiene la Catálogo Curso correspondiente al ID proporcionado',
    })
    @ApiParam({ name: 'id', description: 'ID de la Catálogo Curso', type: String })
    @ApiOkResponse({
      description: 'Catálogo Curso obtenida exitosamente',
      type: CourseCatalogDTO,
    })
    @ApiNotFoundResponse({ description: 'No se encontró la Catálogo Curso con el ID proporcionado' })
    public async findCourseCatalogById(@Param('id') id: string) {
      return await this.CourseCatalogService.findCourseCatalogById(id);
    }
  
  
    /**
   * Buscar un dirección por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Parroquia que coincide con los parámetros de búsqueda
   */
  
      @PublicAccess()
    @Get(':key/:value')
    @ApiOperation({
      summary: 'Buscar una Catálogo Curso por cualquier clave y valor',
      description: 'Busca una Catálogo Curso que coincida con los parámetros de búsqueda',
    })
    @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
    @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
    @ApiOkResponse({
      description: 'Catálogo Curso encontrado exitosamente',
      type: CourseCatalogDTO,
    })
    public async findByAny(
      @Param() params: { key: keyof CourseCatalogDTO; value: string },
    ) {
      
      return await this.CourseCatalogService.findBy({
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
      summary: 'Actualizar una Catálogo Curso',
      description: 'Actualiza una Catálogo Curso existente con los datos proporcionados',
    })
    @ApiParam({ name: 'id', description: 'Identificador de la Catálogo Curso a actualizar', type: String })
    @ApiConsumes('multipart/form-data', 'application/json')
    @ApiBody({ type: CourseCatalogUpdateDTO, description: 'Datos de actualización de la Catálogo Curso' })
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
      description: 'Catálogo Curso actualizada exitosamente',
      type: CourseCatalogDTO,
    })
    @UseInterceptors(FileInterceptor('image'))
    public async updateCourseCatalog(
      @Param('id') id: string,
      @Body() body: CourseCatalogUpdateDTO,
      @UploadedFile() image: Express.Multer.File
    ) {
      const { name } = body;
      const nameExists = await this.CourseCatalogService.checkIfNameExists(name, id);
  
      if (nameExists) {
        throw new ConflictException('Ese nombre de Catálogo Curso ya existe');
      }
      return await this.CourseCatalogService.updateCourseCatalog(id, body, image);
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
      summary: 'Eliminar una Catálogo Curso',
      description: 'Elimina una Catálogo Curso según el identificador proporcionado',
    })
    @ApiParam({ name: 'id', description: 'Identificador de la Catálogo Curso a eliminar', type: String })
    @ApiOkResponse({
      description: 'Catálogo Curso eliminado exitosamente',
      type: String,
    })
    public async deleteCourseCatalog(@Param('id') id: string) {
      return await this.CourseCatalogService.deleteCourseCatalog(id);
    }
  }
  