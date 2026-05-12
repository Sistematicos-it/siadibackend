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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CertificateExchangeService } from '../services/certificate-exchange.service';
import {
  CertificateExchangeDTO,
  UpdateCertificateExchangeDTO,
  ValidateCertificateDTO,
} from '../dto/certificate-exchange.dto';

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
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators';
import { Request } from 'express';

@ApiTags('CertificateExchange') // Esto lo que hace es separar los endpoints en swagger por Tags
@Controller('certificate-exchange')
@UseGuards(AuthGuard, RolesGuard)
export class CertificateExchangeController {
  constructor(
    private readonly CertificateExchangeService: CertificateExchangeService,
  ) {}

  @Roles('FACILITATOR')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar canje de certificado',
    description: 'Registra un nuevo canje de certificado',
  })
  @ApiBody({ type: CertificateExchangeDTO })
  @ApiCreatedResponse({
    description: 'canje de certificado registrada exitosamente',
    type: CertificateExchangeDTO,
  })
  public async createCertificateExchange(
    @Body() body: CertificateExchangeDTO,
    @Req() req: Request,
  ) {
    return await this.CertificateExchangeService.createCertificateExchange(
      body,
      req.idUser,
    );
  }

  @Roles('MANAGER')
  @Post('validate/:id')
  @ApiOperation({
    summary: 'validar canje de certificado',
    description: 'valida un nuevo canje de certificado',
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: ValidateCertificateDTO })
  @ApiCreatedResponse({
    description: 'canje de certificado registrada exitosamente',
    type: CertificateExchangeDTO,
  })
  public async registerAsset(
    @Body() body: ValidateCertificateDTO,
    @Param('id') id: string,
  ) {
    return await this.CertificateExchangeService.validateCertificateExchange(
      id,
      body.status,
      body.observation,
    );
  }
  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos los canje de certificado
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrarlos canje de certificado
   * @returns Lista de canje de certificado según los parámetros de consulta
   */

  @Roles('FACILITATOR', 'MANAGER')
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos los canje de certificado',
    description:
      'Obtiene una lista de todaslos canje de certificado según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiOkResponse({
    description: 'Lista de canje de certificado obtenida exitosamente',
    type: [CertificateExchangeDTO],
  })
  public async findAllCertificateExchange(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    return await this.CertificateExchangeService.findCertificateExchange(
      +page,
      +limit,
      req.idUser,
      req
    );
  }

  @Roles('FACILITATOR', 'MANAGER')
  @Get('print/:id')
  @ApiOperation({
    summary: 'Obtener una canje de certificado por su ID',
    description:
      'Obtiene la canje de certificado correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del canje de certificado',
    type: String,
  })
  @ApiOkResponse({
    description: 'canje de certificado obtenida exitosamente',
    type: CertificateExchangeDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la canje de certificado con el ID proporcionado',
  })
  public async printCertificate(@Param('id') id: string) {
    return await this.CertificateExchangeService.printCertificate(id);
  }

  // @PublicAccess()
  /**
   * Obtener una canje de certificado por su ID
   * @param id ID del canje de certificado a obtener
   * @returns canje de certificado correspondiente al ID proporcionado
   */

  @Roles('FACILITATOR', 'MANAGER')
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una canje de certificado por su ID',
    description:
      'Obtiene la canje de certificado correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del canje de certificado',
    type: String,
  })
  @ApiOkResponse({
    description: 'canje de certificado obtenida exitosamente',
    type: CertificateExchangeDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la canje de certificado con el ID proporcionado',
  })
  public async findCertificateExchangeById(@Param('id') id: string) {
    return await this.CertificateExchangeService.findCertificateExchangeById(
      id,
    );
  }

  /**
   * Buscar un canje de certificado por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns canje de certificado que coincide con los parámetros de búsqueda
   */

  @Roles('FACILITATOR', 'MANAGER')
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una canje de certificado por cualquier clave y valor',
    description:
      'Busca una canje de certificado que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'canje de certificado encontrado exitosamente',
    type: CertificateExchangeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof CertificateExchangeDTO; value: string },
  ) {
    return await this.CertificateExchangeService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una canje de certificado',
    description:
      'Actualiza una canje de certificado existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la canje de certificado a actualizar',
    type: String,
  })
  @ApiBody({
    type: UpdateCertificateExchangeDTO,
    description: 'Datos de actualización de la canje de certificado',
  })
  @ApiOkResponse({
    description: 'canje de certificado actualizada exitosamente',
  })
  public async updateExchange(
    @Param('id') id: string,
    @Body() body: UpdateCertificateExchangeDTO,
  ) {
    return await this.CertificateExchangeService.updateCertificateExchange(
      id,
      body,
    );
  }

  // @PublicAccess()
  /**
   * Eliminar una canje de certificado
   * @param id Identificador del canje de certificado a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('FACILITATOR', 'MANAGER')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una canje de certificado',
    description:
      'Elimina una canje de certificado según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del canje de certificado a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'canje de certificado eliminado exitosamente',
    type: String,
  })
  public async deleteCertificateExchange(@Param('id') id: string) {
    return await this.CertificateExchangeService.deleteCertificateExchange(id);
  }
}
