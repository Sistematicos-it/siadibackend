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
import { BeneficiaryTypeService } from '../services/beneficiary-type.service';
import {
  FindBeneficiaryTypeDTO,
  BeneficiaryTypeDTO,
  BeneficiaryTypeUpdateDTO,
} from '../dto/beneficiary-type.dto';
import { PublicAccess } from '../../../auth/decorators/public.decorator';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators';
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
import { Request } from 'express';

@ApiTags('BeneficiaryType') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('beneficiary-type')
@UseGuards(AuthGuard, RolesGuard)
export class BeneficiaryTypeController {
  constructor(
    private readonly BeneficiaryTypeService: BeneficiaryTypeService,
  ) {}

  // @PublicAccess()
  /**
   * Registrar BeneficiaryType
   * @param body Datos de la Tipo de Beneficiario a registrar
   * @returns Datos de la Tipo de Beneficiario registrado
   */

    @Roles("HUMAN_TALENT")
  @Post('register')
  @ApiOperation({
    summary: 'Registrar Tipo de Beneficiario',
    description: 'Registra una nueva Tipo de Beneficiario',
  })
  @ApiBody({ type: BeneficiaryTypeDTO })
  @ApiCreatedResponse({
    description: 'Tipo de Beneficiario registrada exitosamente',
    type: BeneficiaryTypeDTO,
  })
  public async registerBeneficiaryType(@Body() body: BeneficiaryTypeDTO) {
    return await this.BeneficiaryTypeService.createBeneficiaryType(body);
  }

  // @Roles('ADMIN')
  // @PublicAccess()
  /**
   * Obtener todos las Tipos de Beneficiario
   * @param page Número de página para paginación
   * @param limit Cantidad de registros por página
   * @param search Cadena de búsqueda para filtrar las Tipos de Beneficiario
   * @returns Lista de Tipos de Beneficiario según los parámetros de consulta
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Tipos de Beneficiario',
    description:
      'Obtiene una lista de todas las Tipos de Beneficiario según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Tipos de Beneficiario obtenida exitosamente',
    type: [BeneficiaryTypeDTO],
  })
  public async findAllBeneficiaryType(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request
  ) {
    return await this.BeneficiaryTypeService.findBeneficiaryType(
      +page,
      +limit,
      req
    );
  }

  // @PublicAccess()
  /**
   * Obtener una Tipo de Beneficiario por su ID
   * @param id ID de la Tipo de Beneficiario a obtener
   * @returns Tipo de Beneficiario correspondiente al ID proporcionado
   */

  //TODO: Asignar permisos correctos a este endpoint para rol adicional
  //@Roles("HUMAN_TALENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una Tipo de Beneficiario por su ID',
    description:
      'Obtiene la Tipo de Beneficiario correspondiente al ID proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la Tipo de Beneficiario',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tipo de Beneficiario obtenida exitosamente',
    type: BeneficiaryTypeDTO,
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró la Tipo de Beneficiario con el ID proporcionado',
  })
  public async findBeneficiaryTypeById(@Param('id') id: string) {
    return await this.BeneficiaryTypeService.findBeneficiaryTypeById(id);
  }

  /**
   * Buscar un Tipo de Beneficiario por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Tipo de Beneficiario que coincide con los parámetros de búsqueda
   */

    @Roles("HUMAN_TALENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una Tipo de Beneficiario por cualquier clave y valor',
    description:
      'Busca una Tipo de Beneficiario que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Tipo de Beneficiario encontrado exitosamente',
    type: BeneficiaryTypeDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof BeneficiaryTypeDTO; value: string },
  ) {
    return await this.BeneficiaryTypeService.findBy({
      key: params.key,
      value: params.value,
    });
  }

  // @PublicAccess()
  /**
   * Actualizar una Tipo de Beneficiario
   * @param id Identificador de la Tipo de Beneficiario a actualizar
   * @param body Datos de actualización de la Tipo de Beneficiario
   * @returns Tipo de Beneficiario actualizado
   */

    @Roles("HUMAN_TALENT")
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una Tipo de Beneficiario',
    description:
      'Actualiza una Tipo de Beneficiario existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Tipo de Beneficiario a actualizar',
    type: String,
  })
  @ApiBody({
    type: BeneficiaryTypeUpdateDTO,
    description: 'Datos de actualización de la Tipo de Beneficiario',
  })
  @ApiOkResponse({
    description: 'Tipo de Beneficiario actualizada exitosamente',
    type: BeneficiaryTypeDTO,
  })
  public async updateBeneficiaryType(
    @Param('id') id: string,
    @Body() body: BeneficiaryTypeUpdateDTO,
  ) {
    return await this.BeneficiaryTypeService.updateBeneficiaryType(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una Tipo de Beneficiario
   * @param id Identificador de la Tipo de Beneficiario a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

    @Roles("HUMAN_TALENT")
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una Tipo de Beneficiario',
    description:
      'Elimina una Tipo de Beneficiario según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la Tipo de Beneficiario a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Tipo de Beneficiario eliminado exitosamente',
    type: String,
  })
  public async deleteBeneficiaryType(@Param('id') id: string) {
    return await this.BeneficiaryTypeService.deleteBeneficiaryType(id);
  }
}
