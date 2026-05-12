import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ConflictException,
} from '@nestjs/common';
import { CertificateService } from '../services/certificate.service';
import {
  FindCertificateDTO,
  CertificateDTO,
  CertificateUpdateDTO,
} from '../dto/certificate.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@ApiTags('Certificate') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('certificate')
@UseGuards(AuthGuard, RolesGuard)
export class CertificateController {
  constructor(private readonly CertificateService: CertificateService) {}

  // @PublicAccess()
  /**
   * Registrar Certificate
   * @param body Datos de la certificado a registrar
   * @returns Datos de la certificado registrado
   */
    @Roles("ADMIN")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar certificado',
    description: 'Registra una nueva certificado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CertificateDTO })
  @ApiCreatedResponse({
    description: 'certificado registrada exitosamente',
    type: CertificateDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  public async registerCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CertificateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.CertificateService.checkIfNameExists(name);

    if (nameExists) {
      throw new ConflictException('Ese nombre de certificado ya existe');
    }
    return await this.CertificateService.createCertificate(body, file);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las certificadoses
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las certificadoses
   * @returns Lista de certificadoses según los parámetros de consulta
   */

    @Roles("ADMIN", "CITIZEN")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las certificadoses',
    description:
      'Obtiene una lista de todas las certificadoses según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de certificadoses obtenida exitosamente',
    type: [CertificateDTO],
  })
  public async findAllCertificate(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request
  ) {
    return await this.CertificateService.findCertificate(+page, +limit, req);
  }

  // @PublicAccess()
  /**
   * Obtener una certificado por su ID
   * @param id ID de la certificado a obtener
   * @returns certificado correspondiente al ID proporcionado
   */

  @Roles("ADMIN", "CITIZEN")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una certificado por su ID',
    description: 'Obtiene la certificado correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la certificado', type: String })
  @ApiOkResponse({
    description: 'certificado obtenida exitosamente',
    type: CertificateDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la certificado con el ID proporcionado',
  })
  public async findCertificateById(@Param('id') id: string) {
    return await this.CertificateService.findCertificateById(id);
  }

  /**
   * Buscar un certificado por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns certificado que coincide con los parámetros de búsqueda
   */

  @Roles("ADMIN", "CITIZEN")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una certificado por cualquier clave y valor',
    description:
      'Busca una certificado que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'certificado encontrado exitosamente',
    type: CertificateDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CertificateDTO; value: string },
  ) {
    return await this.CertificateService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una certificado
   * @param id Identificador de la certificado a actualizar
   * @param body Datos de actualización de la certificado
   * @returns certificado actualizado
   */

    @Roles("ADMIN")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una certificado',
    description:
      'Actualiza una certificado existente con los datos proporcionados, el id en details hace referencia a el identificador de un detalle del certificado se provee en caso de querer actualizar alguno de los detalles, en caso de que se quieran crear se ommite el id en details para la nueva entrada,',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del certificado a actualizar',
    type: String,
  })
  @ApiBody({
    type: CertificateUpdateDTO,
    description: 'Datos de actualización de la certificado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'certificado actualizado exitosamente',
    type: CertificateDTO,
  })
  @UseInterceptors(FileInterceptor('file'))
  public async updateCertificate(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: CertificateUpdateDTO,
  ) {
    const { name } = body;
    const nameExists = await this.CertificateService.checkIfNameExists(name, id);

    if (nameExists) {
      throw new ConflictException('Ese nombre de certificado ya existe');
    }
    return await this.CertificateService.updateCertificate(id, body, image);
  }

  // @PublicAccess()
  /**
   * Eliminar una certificado
   * @param id Identificador de la certificado a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("ADMIN")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una certificado',
    description: 'Elimina una certificado según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la certificado a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'certificado eliminado exitosamente',
    type: String,
  })
  public async deleteCertificate(@Param('id') id: string) {
    return await this.CertificateService.deleteCertificate(id);
  }
}
