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
import { DashboardService } from '../services/dashboard.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import {
  DashboardDTO, FilterCardsDashboardDTO, ResultDashboardDTO, ResultInfoCardDashboardDTO, ResultWithLabelDashboardDTO,
} from '../dto/dashboard.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators';
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
import { STATUS_IN_PLANNING } from 'src/constants/enums';

@ApiTags('Dashboard') // Esto lo que hace es separar los endpoint en swagger por Tags
@Controller('dashboard')
// @UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // @PublicAccess()
  /**
   * Registrar Dashboard
   * @param body Datos de la Tarjetas Superiores
   * @returns Datos de la tarjetas superiores
   */

  // @UseGuards(AuthGuard)
  //   @Roles("TECHNICAL_ASSISTENT")
  @Post('get-info-card')
  @ApiOperation({
    summary: 'Tarjetas Superiores',
    description: 'Obtener la informacion de las tarjetas superiores del dashboard',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultInfoCardDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async getInfoCardDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }

    console.log(filters);
    return await this.dashboardService.getInfoCardDashboard(filters);
  }


  @Post('total-visit-training-by-gender')
  @ApiOperation({
    summary: 'Total de Visitas por genero',
    description: 'Total de visitas y capacitaciones por género',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async totalVisitAndTrainingByGenderDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }
    return await this.dashboardService.totalVisitAndTrainingByGenderDashboard(filters);
  }


  @Post('total-visit-training-by-etnias')
  @ApiOperation({
    summary: 'Total de Visitas por etnias',
    description: 'Total de visitas y capacitaciones por etnias',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async totalVisitAndTrainingByEthnicityDashboard(
    @Body() body: any
    ) {
      const filters = {
        ...body
      }
    return await this.dashboardService.totalVisitAndTrainingByEthnicityDashboard(filters);
  }

  @Post('total-ticket-by-states')
  @ApiOperation({
    summary: 'Total de ticket',
    description: 'Total de ticket generado',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  public async totalTicketByStatusDashboard(
    @Body() body: any,
  ) {

    const filters = {
      ...body
    }
    return await this.dashboardService.totalTicketByStatusDashboard(filters);
  }

  @Post('total-visits-and-training-by-age-range')
  @ApiOperation({
    summary: 'Total de visitas y capacitaciones',
    description: 'Total de visitas y capacitaciones por rango de edad',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async totalVisitAndTrainingDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }
    return await this.dashboardService.totalVisitAndTrainingDashboard(filters);
  }


  @Post('total-connectivity-tecnology-and-speed')
  @ApiOperation({
    summary: 'Total de conectividad',
    description: 'Total de conectividad por tecnología y velocidad',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultWithLabelDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async totalConnectivityTecnologyAndSpeedDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }
    return await this.dashboardService.totalConnectivityTecnologyAndSpeedDashboard(filters);
  }


  @Post('total-doc-by-type')
  @ApiOperation({
    summary: 'Total de documentos',
    description: 'Total de documentos subidos por tipo',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  public async totalDocUpByTypeDashboard(
    // @Body() body: DashboardDTO,
    @Query('category') category: string,
  ) {
    return await this.dashboardService.totalDocUpByTypeDashboard(category);
  }

  @Post('total-assets-by-type')
  @ApiOperation({
    summary: 'Total de bienes',
    description: 'Total de bienes por tipo',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  public async totalAssetsByTypeDashboard(
    @Body() body: any,
  ) {
    let filters = {...body}
    return await this.dashboardService.totalAssetsByTypeDashboard(filters);
  }

  @Post('total-visits-and-training-by-provinces')
  @ApiOperation({
    summary: 'Total de visitas y capacitaciones',
    description: 'Total de visitas y capacitaciones por provincias',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultWithLabelDashboardDTO,
  })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'pde', type: String, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'month', type: Number, required: false })
  @ApiQuery({ name: 'region', type: String, required: false })
  @ApiQuery({ name: 'province', type: String, required: false })
  @ApiQuery({ name: 'canton', type: String, required: false })
  @ApiQuery({ name: 'parish', type: String, required: false })
  public async totalVisitsAndTrainingByProvincesDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }
    return await this.dashboardService.totalVisitsAndTrainingByProvincesDashboard(filters);
  }


  @Post('total-pde-by-provinces-and-states')
  @ApiOperation({
    summary: 'Total de PDE',
    description: 'Total de PDE por provincias y estados ',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultWithLabelDashboardDTO,
  })
  public async totalPdeByProvincesAndStatesDashboard(
    @Body() body: any
  ) {
    const filters = {
      ...body
    }
    return await this.dashboardService.totalPdeByProvincesAndStatesDashboard(filters);
  }


  @Post('total-operation-of-pde-by-states')
  @ApiOperation({
    summary: 'Total de operatividad',
    description: 'Total de operatividad de PDE por estados',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  public async totalOperationOfPdeByStatesDashboard(
    // @Body() body: DashboardDTO,
  ) {
    return await this.dashboardService.totalOperationOfPdeByStatesDashboard();
  }

  @Post('total-assets-by-type-and-states')
  @ApiOperation({
    summary: 'Total de bienes',
    description: 'Total de bienes de tipos por estados',
  })
  // @ApiBody({ type: DashboardDTO })
  @ApiOkResponse({
    description: 'Se ha obtenido la informacion satisfactoriamente',
    type: ResultDashboardDTO,
  })
  public async totalOperationOfTypesAndByStatesDashboard(
    @Body() body: any,
    ) {
      let filters = {...body}
    return await this.dashboardService.getAssetsByStatusAndType(filters);
  }
}
