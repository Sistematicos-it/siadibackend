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
  Req,
} from '@nestjs/common';
import { BeneficiaryService } from '../services/beneficiary.service';
import {
  FindBeneficiaryDTO,
  BeneficiaryDTO,
  BeneficiaryUpdateDTO,
} from '../dto/beneficiary.dto';

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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('Beneficiary') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('beneficiary')
@UseGuards(AuthGuard, RolesGuard)
export class BeneficiaryController {
  constructor(private readonly BeneficiaryService: BeneficiaryService) {}

  // @PublicAccess()
  /**
   * Registrar Beneficiary
   * @param body Datos del beneficiarios a registrar
   * @returns Datos del beneficiarios registrado
   */

  @Roles('HUMAN_TALENT')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar beneficiarios',
    description: 'Registra una nueva beneficiarios',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BeneficiaryDTO })
  @ApiCreatedResponse({
    description: 'beneficiarios registrada exitosamente',
    type: BeneficiaryDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async registerBeneficiary(
    @Body() body: BeneficiaryDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.BeneficiaryService.createBeneficiary(
      body,
      files,
      req.idUser,
      req.ip
    );
  }

  @Roles('HUMAN_TALENT')
  @Post(':id/files')
  @ApiOperation({
    summary: 'Subir archivos al beneficiario',
    description: 'Sube nuevos archivos al beneficiario',
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
    return await this.BeneficiaryService.addFiles(id, files);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los beneficiarios
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos beneficiarios
   * @returns Lista de beneficiarios según los parámetros de consulta
   */
  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles('HUMAN_TALENT', 'ADMIN', "MONITOR")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los beneficiarios',
    description:
      'Obtiene una lista de todaslos beneficiarios según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de beneficiarios obtenida exitosamente',
    type: [BeneficiaryDTO],
  })
  public async findAllBeneficiary(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.BeneficiaryService.findBeneficiary(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una beneficiarios por su ID
   * @param id ID del beneficiarios a obtener
   * @returns beneficiarios correspondiente al ID proporcionado
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles('HUMAN_TALENT', 'ADMIN', "MONITOR")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una beneficiarios por su ID',
    description: 'Obtiene la beneficiarios correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID del beneficiarios', type: String })
  @ApiOkResponse({
    description: 'beneficiarios obtenida exitosamente',
    type: BeneficiaryDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la beneficiarios con el ID proporcionado',
  })
  public async findBeneficiaryById(@Param('id') id: string) {
    return await this.BeneficiaryService.findBeneficiaryById(id);
  }

  /**
   * Buscar un beneficiarios por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns beneficiarios que coincide con los parámetros de búsqueda
   */

  @Roles('HUMAN_TALENT', 'ADMIN', "MONITOR")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una beneficiarios por cualquier clave y valor',
    description:
      'Busca una beneficiarios que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'beneficiarios encontrado exitosamente',
    type: BeneficiaryDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof BeneficiaryDTO; value: string },
  ) {
    return await this.BeneficiaryService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una beneficiarios
   * @param id Identificador del beneficiarios a actualizar
   * @param body Datos de actualización del beneficiarios
   * @returns beneficiarios actualizado
   */

  @Roles('HUMAN_TALENT')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una beneficiarios',
    description:
      'Actualiza una beneficiarios existente con los datos proporcionados',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Identificador del beneficiarios a actualizar',
    type: String,
  })
  @ApiBody({
    type: BeneficiaryUpdateDTO,
    description: 'Datos de actualización del beneficiarios',
  })
  @ApiOkResponse({
    description: 'beneficiarios actualizada exitosamente',
    type: BeneficiaryDTO,
  })
  @UseInterceptors(FilesInterceptor('files'))
  public async updateBeneficiary(
    @Param('id') id: string,
    @Body() body: BeneficiaryUpdateDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.BeneficiaryService.updateBeneficiary(
      id,
      body,
      files,
      req.idUser,
      req.ip
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una beneficiarios
   * @param id Identificador del beneficiarios a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('HUMAN_TALENT')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una beneficiarios',
    description:
      'Elimina una beneficiarios según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del beneficiarios a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'beneficiarios eliminado exitosamente',
    type: String,
  })
  public async deleteBeneficiary(@Param('id') id: string, @Req() req: Request) {
    return await this.BeneficiaryService.deleteBeneficiary(id, req.idUser, req.ip);
  }
}
