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
import { AddressService } from '../services/address.service';
import {
  FindAddressDTO,
  AddressDTO,
  AddressUpdateDTO,
} from '../dto/address.dto';
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

@ApiTags('Address') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('address')
@UseGuards(AuthGuard, RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // @PublicAccess()
  /**
   * Registrar address
   * @param body Datos de la dirección a registrar
   * @returns Datos de la dirección registrado
   */

  @Roles('ADMIN')
  @Post('register')
  @ApiOperation({
    summary: 'Registrar address',
    description: 'Registra un nuevo address',
  })
  @ApiBody({ type: AddressDTO })
  @ApiCreatedResponse({
    description: 'Parroquia registrado exitosamente',
    type: AddressDTO,
  })
  public async registerAddress(@Body() body: AddressDTO) {
    return await this.addressService.createAddress(body);
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
  @Roles('ADMIN', 'HUMAN_TALENT', 'MONITOR', 'MANAGER', "TECHNICAL_ASSISTENT")
  @Get('all')
  @ApiOperation({
    summary: 'Obtener todos las Direcciones',
    description:
      'Obtiene una lista de todas las Direcciones según los parámetros de consulta',
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiOkResponse({
    description: 'Lista de Dirección obtenida exitosamente',
    type: [AddressDTO],
  })
  public async findAllAddress(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: Request
  ) {
    return await this.addressService.findAddress(+page, +limit, search, req);
  }

  // @PublicAccess()
  /**
   * Obtener una dirección por su ID
   * @param id ID de la dirección a obtener
   * @returns Parroquia correspondiente al ID proporcionado
   */

  @Roles('ADMIN', 'HUMAN_TALENT', 'MONITOR', 'MANAGER', "TECHNICAL_ASSISTENT")
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una dirección por su ID',
    description: 'Obtiene la dirección correspondiente al ID proporcionado',
  })
  @ApiParam({ name: 'id', description: 'ID de la dirección', type: String })
  @ApiOkResponse({
    description: 'Parroquia obtenida exitosamente',
    type: AddressDTO,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró la Parroquia con el ID proporcionado',
  })
  public async findAddressById(@Param('id') id: string) {
    return await this.addressService.findAddressById(id);
  }

  /**
   * Buscar un dirección por cualquier clave y valor
   * @param params Parámetros de búsqueda: clave y valor
   * @returns Parroquia que coincide con los parámetros de búsqueda
   */

  @Roles('ADMIN', 'HUMAN_TALENT', 'MONITOR', 'MANAGER', "TECHNICAL_ASSISTENT")
  @Get(':key/:value')
  @ApiOperation({
    summary: 'Buscar una dirección por cualquier clave y valor',
    description:
      'Busca una dirección que coincida con los parámetros de búsqueda',
  })
  @ApiParam({ name: 'value', description: 'Valor de búsqueda', type: String })
  @ApiParam({ name: 'key', description: 'Clave de búsqueda', enum: ['name'] })
  @ApiOkResponse({
    description: 'Parroquia encontrado exitosamente',
    type: AddressDTO,
  })
  public async findByAny(
    @Param() params: { key: keyof AddressDTO; value: string },
  ) {
    return await this.addressService.findBy({
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

  @Roles('ADMIN')
  @Patch('edit/:id')
  @ApiOperation({
    summary: 'Actualizar una dirección',
    description:
      'Actualiza una dirección existente con los datos proporcionados',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la dirección a actualizar',
    type: String,
  })
  @ApiBody({
    type: AddressUpdateDTO,
    description: 'Datos de actualización de la dirección',
  })
  @ApiOkResponse({
    description: 'Parroquia actualizada exitosamente',
    type: AddressDTO,
  })
  public async updateAddress(
    @Param('id') id: string,
    @Body() body: AddressUpdateDTO,
  ) {
    return await this.addressService.updateAddress(id, body);
  }

  // @PublicAccess()
  /**
   * Eliminar una dirección
   * @param id Identificador de la dirección a eliminar
   * @returns Mensaje de éxito en caso de eliminación exitosa
   */

  @Roles('ADMIN')
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Eliminar una dirección',
    description: 'Elimina una dirección según el identificador proporcionado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la dirección a eliminar',
    type: String,
  })
  @ApiOkResponse({
    description: 'Parroquia eliminado exitosamente',
    type: String,
  })
  public async deleteAddress(@Param('id') id: string) {
    return await this.addressService.deleteAddress(id);
  }
}
