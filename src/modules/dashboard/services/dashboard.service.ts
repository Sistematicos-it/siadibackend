import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import {
  DashboardDTO,
  FilterCardsDashboardDTO,
  FiltersDTO,
  InfoCardDashboardDTO,
  ResultDashboardDTO,
  ResultInfoCardDashboardDTO,
  ResultWithLabelDashboardDTO,
} from '../dto/dashboard.dto';
import { ErrorManager } from '../../../utils/error.manager';
import { EmployeeEntity } from 'src/modules/employee/entities/employee.entity';
import { EmployeeService } from 'src/modules/employee/services/employee.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { AddressService } from 'src/modules/nomencladores/geolocation/services/address.service';

import { EquipmentService } from 'src/modules/nomencladores/equipment/services/equipment.service';
import { ComponentService } from 'src/modules/nomencladores/component/services/component.service';
import { ReportService } from 'src/modules/nomencladores/reports/services/report.service';
import { PointService } from 'src/modules/points/services/point.service';
import { ASSET_STATUS, STATUS_IN_PLANNING } from 'src/constants/enums';
import { ROLES } from 'src/constants';
import { TotalGeneralViewEntity } from '../entities/total-general-view.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { TotalVisitantesPorGeneroEntity } from '../entities/total-visitantes-por-genero-view.entity';
import { TotalVisitantesPorEtniaEntity } from '../entities/total-visitas-por-etnia-view.entity';
import { TotalVisitantesPorRangoEdadEntity } from '../entities/total-visitas-por-rango-de-edad.entity';
import { TotalBienesPorTipoViewEntity } from '../entities/tota-bienes-por-tipos-view.entity';
import { TotalConectividadViewEntity } from '../entities/total-conectividad-view.entity';
import { TotalVisitantesPorProvinciasViewEntity } from '../entities/total-visitas-capacitaciones-provincias.view.entity';
import { TotalIncidentsByStatusViewEntity } from '../entities/total-ticket-por-estado.entity';
// import { TotalConectividadByTecnologyAndSpeedViewEntity } from '../entities/total-conectividad-por-tecnologia-velocidad.entity';
import { VisitTypeEntity } from 'src/modules/visit-type/entities/visit-type.entity';
import { TotalVisitsAndTrainingsByProvinceViewEntity } from '../entities/total_visitas_capacitaciones_por_provincias.entity';
import { TotalPuntosDeEncuentroPorProvinciaYEstadoEntity } from '../entities/total-puntos-por-provincia-y-estado.entity';
import { TotalPointsByStatusView } from '../entities/total-punto-por-estados.entity';
import { IncidentEntity } from 'src/modules/incident/entities/incident.entity';
import { ASSET_CATEGORY } from 'src/modules/nomencladores/asset-type/interfaces/asset-type.interface';
import { AssetStatusByTypeAndStatusViewEntity } from '../entities/tota-bienes-tipos-estados-view.entity';
import { AssetEntity } from 'src/modules/asset/entities/asset.entity';
import { calcularPorcentaje } from 'src/utils/helpers';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';
import { PointEntity } from 'src/modules/points/entities/point.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(TotalGeneralViewEntity)
    private totalGeneralViewRepository: Repository<TotalGeneralViewEntity>,

    @InjectRepository(TotalVisitantesPorGeneroEntity)
    private totalVisitantesPorGeneroRepository: Repository<TotalVisitantesPorGeneroEntity>,

    @InjectRepository(TotalVisitantesPorEtniaEntity)
    private totalVisitantesPorEtniaRepository: Repository<TotalVisitantesPorEtniaEntity>,

    @InjectRepository(TotalVisitantesPorRangoEdadEntity)
    private totalVisitantesPorRangoEdadRepository: Repository<TotalVisitantesPorRangoEdadEntity>,

    @InjectRepository(TotalBienesPorTipoViewEntity)
    private bienesPorTipoRepository: Repository<TotalBienesPorTipoViewEntity>,

    @InjectRepository(AssetStatusByTypeAndStatusViewEntity)
    private readonly assetStatusByTypeViewRepository: Repository<AssetStatusByTypeAndStatusViewEntity>,

    @InjectRepository(TotalConectividadViewEntity)
    private totalConectividadRepository: Repository<TotalConectividadViewEntity>,

    @InjectRepository(TotalVisitantesPorProvinciasViewEntity)
    private totalVisitantesPorProvinciasRepository: Repository<TotalVisitantesPorProvinciasViewEntity>,

    @InjectRepository(TotalIncidentsByStatusViewEntity)
    private totalIncidentsByStatusViewRepository: Repository<TotalIncidentsByStatusViewEntity>,

    @InjectRepository(PointEntity)
    private readonly pointRepository: Repository<PointEntity>,

    // @InjectRepository(TotalConectividadByTecnologyAndSpeedViewEntity)
    // private readonly totalConectividadByTecnologyAndSpeedViewRepository: Repository<TotalConectividadByTecnologyAndSpeedViewEntity>,

    @InjectRepository(TotalVisitsAndTrainingsByProvinceViewEntity)
    private readonly totalVisitsAndTrainingsByProvinceRepository: Repository<TotalVisitsAndTrainingsByProvinceViewEntity>,

    @InjectRepository(VisitTypeEntity)
    private readonly visitTypesRepo: Repository<VisitTypeEntity>,

    @InjectRepository(TotalPuntosDeEncuentroPorProvinciaYEstadoEntity)
    private totalPuntosDeEncuentroRepository: Repository<TotalPuntosDeEncuentroPorProvinciaYEstadoEntity>,

    @InjectRepository(TotalPointsByStatusView)
    private pointsByStatusViewRepository: Repository<TotalPointsByStatusView>,

    @InjectRepository(IncidentEntity)
    private incidentRepository: Repository<IncidentEntity>,

    @InjectRepository(AssetEntity)
    private assetsRepository: Repository<AssetEntity>,

    @InjectRepository(ConectivityEntity)
    private conectivityRepository: Repository<ConectivityEntity>,

    private readonly fileService: FileService,
  ) {}
  // tarjetas
  public async getInfoCardDashboard(
    filters: FilterCardsDashboardDTO,
  ): Promise<ResultInfoCardDashboardDTO | any | null> {
    try {
      const { pde, month, year, parish, canton, province, region } = filters;

      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
        },
      });

      //console.log('POINTS', points);

      let pdes = points?.map((p) => p?.id);

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }

      const queryBuilder =
        this.totalGeneralViewRepository.createQueryBuilder(
          'total_general_view',
        );
      queryBuilder
        .select('total_general_view.value', 'value')
        .addSelect('SUM(total_general_view.cantidad)', 'cant')
        .groupBy('total_general_view.value');

      // Verificar si 'pde' tiene valor antes de agregar la cláusula WHERE

      queryBuilder.andWhere('total_general_view.point_id IN (:...pde)', {
        pde: pdes,
      });

      // Verificar si 'mes' tiene valor antes de agregar la cláusula WHERE
      if (month) {
        queryBuilder.andWhere('total_general_view.mes = :mes', { mes: month });
      }

      // Verificar si 'anno' tiene valor antes de agregar la cláusula WHERE
      if (year) {
        queryBuilder.andWhere('total_general_view.anno = :anno', {
          anno: year,
        });
      }

      const result = await queryBuilder.getRawMany();

      let totalViews = 0;
      let totalTrainings = 0;
      let totalVirtualTrainings = 0;
      let totalVisitors = 0;
      for (const iterator of result) {
        if (iterator.value === 'totalViews') {
          totalViews = iterator.cant;
        }
        if (iterator.value === 'ON_SITE') {
          totalTrainings = iterator.cant;
        }
        if (iterator.value === 'VIRTUAL') {
          totalVirtualTrainings = iterator.cant;
        }
        if (iterator.value === 'totalVisitors') {
          totalVisitors = iterator.cant;
        }
      }

      return {
        data: {
          totalViews,
          totalTrainings,
          totalVirtualTrainings,
          totalVisitors,
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  // Total de visitas y capacitaciones por género
  public async totalVisitAndTrainingByGenderDashboard(
    filters: FilterCardsDashboardDTO,
  ): Promise<ResultDashboardDTO | any | null> {
    try {
      const { pde, month, year, parish, canton, province, region } = filters;

      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
        },
      });

      //('POINTS', points);

      let pdes = points?.map((p) => p?.id);

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }

      // Consulta para obtener el total de visitas y capacitaciones sin aplicar filtros
      const totalQuery = this.totalVisitantesPorGeneroRepository
        .createQueryBuilder('total_visitantes_por_genero')
        .select('SUM(cantidad)', 'total');

      totalQuery.andWhere('total_visitantes_por_genero.point_id IN (:...pde)', {
        pde: pdes,
      });

      if (month) {
        totalQuery.andWhere('total_visitantes_por_genero.mes = :month', {
          month,
        });
      }

      if (year) {
        totalQuery.andWhere('total_visitantes_por_genero.anno = :year', {
          year,
        });
      }

      const totalResult = await totalQuery.getRawOne();

      const queryBuilder = this.totalVisitantesPorGeneroRepository
        .createQueryBuilder('total_visitantes_por_genero')
        .select('genero')
        .addSelect('SUM(cantidad)', 'cant');

      if (pdes?.length > 0) {
        queryBuilder.andWhere(
          'total_visitantes_por_genero.point_id IN (:...pde)',
          { pde: pdes },
        );
      }

      if (month) {
        queryBuilder.andWhere('total_visitantes_por_genero.mes = :month', {
          month,
        });
      }

      if (year) {
        queryBuilder.andWhere('total_visitantes_por_genero.anno = :year', {
          year,
        });
      }

      queryBuilder.groupBy('genero');
      const result = await queryBuilder.getRawMany();

      const objResult: ResultDashboardDTO = {
        data: [
          { value: 0, name: 'Total de hombres' },
          { value: 0, name: 'Total de mujeres' },
        ],
      };
      if (result.length > 0) {
        for (const iterator of result) {
          if (iterator.genero === 'M') {
            objResult.data[0].value = iterator.cant;
            objResult.data[0].name = `${
              objResult.data[0].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
          if (iterator.genero === 'F') {
            objResult.data[1].value = iterator.cant;
            objResult.data[1].name = `${
              objResult.data[1].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
        }
      }
      return objResult;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de visitas y capacitaciones por etnias
  public async totalVisitAndTrainingByEthnicityDashboard(
    filters: FilterCardsDashboardDTO,
  ): Promise<ResultDashboardDTO | any | null> {
    try {
      const { pde, month, year, parish, canton, province, region } = filters;

      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
        },
      });
      //console.log(query);

      //console.log('POINTS', points);

      let pdes = points?.map((p) => p?.id);

      //console.log(pdes);

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }
      // Consulta para obtener el total de visitas y capacitaciones sin aplicar filtros
      const totalQuery = this.totalVisitantesPorGeneroRepository
        .createQueryBuilder('total_visitantes_por_etnia')
        .select('SUM(cantidad)', 'total');

      totalQuery.andWhere('total_visitantes_por_etnia.point_id IN (:...pde)', {
        pde: pdes,
      });

      if (month) {
        totalQuery.andWhere('total_visitantes_por_etnia.mes = :month', {
          month,
        });
      }

      if (year) {
        totalQuery.andWhere('total_visitantes_por_etnia.anno = :year', {
          year,
        });
      }

      const totalResult = await totalQuery.getRawOne();

      const queryBuilder = this.totalVisitantesPorEtniaRepository
        .createQueryBuilder('total_visitantes_por_etnia')
        .select('etnia')
        .select()
        .addSelect('SUM(cantidad)', 'cant');

      queryBuilder.andWhere(
        'total_visitantes_por_etnia.point_id IN (:...pde)',
        { pde: pdes },
      );

      if (month) {
        queryBuilder.andWhere('total_visitantes_por_etnia.mes = :month', {
          month,
        });
      }

      if (year) {
        queryBuilder.andWhere('total_visitantes_por_etnia.anno = :year', {
          year,
        });
      }

      queryBuilder.groupBy('etnia');

      const result = await queryBuilder.getRawMany();
      //console.log(result);
      let objResult: ResultDashboardDTO = {
        data: [
          { value: 0, name: 'Afroecuatoriana' },
          { value: 0, name: 'Mestiza' },
          { value: 0, name: 'Indígena' },
          { value: 0, name: 'Blanca' },
          { value: 0, name: 'Montubia' },
        ],
      };
      if (result.length > 0) {
        for (const iterator of result) {
          if (iterator.etnia === 'Afro-Ecuatoriano') {
            objResult.data[0].value = iterator.cant;
            objResult.data[0].name = `${
              objResult.data[0].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
          if (iterator.etnia === 'Mestizo') {
            objResult.data[1].value = iterator.cant;
            objResult.data[1].name = `${
              objResult.data[1].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
          if (iterator.etnia === 'Indigena') {
            objResult.data[2].value = iterator.cant;
            objResult.data[2].name = `${
              objResult.data[2].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
          if (iterator.etnia === 'Blanco') {
            objResult.data[3].value = iterator.cant;
            objResult.data[3].name = `${
              objResult.data[3].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
          if (iterator.etnia === 'Montubia') {
            objResult.data[4].value = iterator.cant;
            objResult.data[4].name = `${
              objResult.data[4].name
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
        }
      }

      return objResult;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de Tikets por Estado
  public async totalTicketByStatusDashboard(
    filters: any,
  ): Promise<ResultDashboardDTO | null> {
    let openIncidents = 0;
    let resolvedIncidents = 0;
    let inactiveIncidents = 0;
    try {
      const { pde, month, year, parish, canton, province, region } = filters;

      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
        },
      });

      //console.log('POINTS', points);

      let pdes = points?.map((p) => p?.id);

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }

      const incidents = await this.incidentRepository
        .createQueryBuilder('incident')
        .leftJoinAndSelect('incident.point', 'point')
        .andWhere('point.id IN (:...pde)', { pde: pdes })
        .getMany();

      if (incidents.length > 0) {
        incidents.forEach((incident) => {
          if (incident.solved_date && incident.closed_date) {
            inactiveIncidents++;
          } else if (incident.solved_date && !incident.closed_date) {
            resolvedIncidents++;
          } else if (!incident.solved_date && incident.closed_date) {
            inactiveIncidents++;
          } else {
            openIncidents++;
          }
        });
      }

      return {
        data: [
          {
            value: openIncidents,
            name: `Abierto (${calcularPorcentaje(
              openIncidents,
              incidents.length,
            )}%)`,
          },
          {
            value: resolvedIncidents,
            name: `Resuelto (${calcularPorcentaje(
              resolvedIncidents,
              incidents.length,
            )}%)`,
          },
          {
            value: inactiveIncidents,
            name: `Cerrado (${calcularPorcentaje(
              inactiveIncidents,
              incidents.length,
            )}%)`,
          },
        ],
      };
    } catch (error) {
      //console.log(error);
      console.log(error);
      return {
        data: [
          { value: openIncidents, name: 'Abierto' },
          { value: resolvedIncidents, name: 'Resuelto' },
          { value: inactiveIncidents, name: 'Cerrado' },
        ],
      };
    }
  }

  // Total de visitas y capacitaciones por rango de edad
  public async totalVisitAndTrainingDashboard(
    filters: FilterCardsDashboardDTO,
  ): Promise<ResultDashboardDTO | any | null> {
    try {
      const { pde, month, year, parish, canton, province, region } = filters;

      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
        },
      });

      //console.log('POINTS', points);

      let pdes = points?.map((p) => p?.id);

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }

      // Consulta para obtener el total de visitas y capacitaciones sin aplicar filtros
      const totalQuery = this.totalVisitantesPorRangoEdadRepository
        .createQueryBuilder('total_visitantes_por_rango_edad')
        .select('SUM(cantidad)', 'total');

      totalQuery.andWhere(
        'total_visitantes_por_rango_edad.point_id IN (:...pde)',
        { pde: pdes },
      );

      if (month) {
        totalQuery.andWhere('total_visitantes_por_rango_edad.mes = :month', {
          month,
        });
      }

      if (year) {
        totalQuery.andWhere('total_visitantes_por_rango_edad.anno = :year', {
          year,
        });
      }

      const totalResult = await totalQuery.getRawOne();

      const queryBuilder = this.totalVisitantesPorRangoEdadRepository
        .createQueryBuilder('total_visitantes_por_rango_edad')
        .select('denominacion')
        .addSelect('SUM(cantidad)', 'cant');

      queryBuilder.andWhere(
        'total_visitantes_por_rango_edad.point_id IN (:...pde)',
        { pde: pdes },
      );

      if (month) {
        queryBuilder.andWhere('total_visitantes_por_rango_edad.mes = :mes', {
          mes: month,
        });
      }

      if (year) {
        queryBuilder.andWhere('total_visitantes_por_rango_edad.anno = :anno', {
          anno: year,
        });
      }

      queryBuilder.groupBy('denominacion');

      const result = await queryBuilder.getRawMany();

      const objResult: ResultDashboardDTO = {
        data: [
          { value: 0, name: 'Menor de edad mujeres' },
          { value: 0, name: 'Mayor de edad hombres' },
          { value: 0, name: 'Menor de edad hombres' },
          { value: 0, name: 'Mayor de edad mujeres' },
        ],
      };

      if (result.length > 0) {
        for (const iterator of result) {
          const index = objResult.data.findIndex(
            (item) => item.name === iterator.denominacion,
          );
          if (index !== -1) {
            objResult.data[index].value = iterator.cant;
            objResult.data[index].name = `${
              iterator.denominacion
            } (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
        }
      }
      return objResult;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de conectividad por tecnología y velocidad
  // .select(['connectivity.technology AS label', 'connectivity.speed AS name', 'connectivity.total AS data'])
  public async totalConnectivityTecnologyAndSpeedDashboard(
    filters: FiltersDTO,
  ): Promise<
    { label: string[]; series: { name: string; data: number[] }[] } | any
  > {
    const query = this.conectivityRepository
      .createQueryBuilder('connectivity')
      .leftJoinAndSelect('connectivity.speed', 'speed')
      .leftJoinAndSelect('connectivity.technology', 'technology')
      .leftJoinAndSelect('connectivity.point', 'point')
      .leftJoinAndSelect('point.address', 'address')
      .leftJoinAndSelect('address.parish', 'parish')
      .leftJoinAndSelect('parish.canton', 'canton')
      .leftJoinAndSelect('canton.province', 'province')
      .leftJoinAndSelect('province.region', 'region');

    //console.log(filters);

    if (filters.year) {
      query.andWhere('EXTRACT(YEAR FROM connectivity.date) = :year', {
        year: filters.year,
      });
    }

    if (filters.month) {
      query.andWhere('EXTRACT(MONTH FROM connectivity.date) = :month', {
        month: filters.month,
      });
    }

    if (filters.region) {
      query.andWhere('region.id = :region', { region: filters.region });
    }

    if (filters.province) {
      query.andWhere('province.id = :province', {
        province: filters.province,
      });
    }

    if (filters.canton) {
      query.andWhere('canton.id = :canton', { canton: filters.canton });
    }

    if (filters.parish) {
      query.andWhere('parish.id = :parish', { parish: filters.parish });
    }

    // Agregar los filtros pde, year y month
    if (filters.pde) {
      query.andWhere('point.id = :pde', { pde: filters.pde });
    }

    const result = await query.getRawMany();
    //console.log(result);
    const totalItems = await this.conectivityRepository.count();

    const data = {
      label: [],
      series: [],
    };

    const speedNames = [...new Set(result.map((item) => item.speed_name))];
    const technologyNames = [
      ...new Set(result.map((item) => item.technology_name)),
    ];

    speedNames.forEach((speedName) => {
      const seriesValues = [];

      technologyNames.forEach((technologyName) => {
        const totalCount = result.filter(
          (item) =>
            item.speed_name === speedName &&
            item.technology_name === technologyName,
        ).length;
        const totalByTecnology = result.filter(
          (item) => item.technology_name === technologyName,
        ).length;

        technologyName = `${technologyName} (${calcularPorcentaje(
          totalByTecnology,
          totalItems,
        )})`;
        data.label = [...data.label, technologyName];
        seriesValues.push(totalCount);
      });

      data.label = [...new Set(data.label.map((item) => item))];
      data.series.push({ name: speedName, data: seriesValues });
    });

    return data;
  }

  // Total de documentos subidos por tipo
  public async totalDocUpByTypeDashboard(
    idCategory: string,
  ): Promise<ResultDashboardDTO | null> {
    try {
      const result: ResultDashboardDTO = {
        data: [],
      };
      const totalResult = await this.fileService.getTotalFileCount();
      const filesResult = await this.fileService.getFilesCountByCategory(
        idCategory,
      );
      for (const iterator of filesResult) {
        result.data.push({
          name: `${iterator.category} (${calcularPorcentaje(
            +iterator.count,
            totalResult,
          )}%)`,
          value: +iterator.count,
        });
      }
      return result.data.length > 0
        ? result
        : {
            data: [{ name: 'Sin Categoría', value: 0 }],
          };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de bienes por tipo
  public async totalAssetsByTypeDashboard(
    filters: any,
  ): Promise<ResultDashboardDTO | any | null> {
    const { pde, month, year, parish, canton, province, region } = filters;

    let query: any = {
      address: {
        parish: {
          ...(parish && { id: parish }),
          canton: {
            ...(canton && { id: canton }),
            province: {
              ...(province && { id: province }),
              ...(region && { region: { id: region } }),
            },
          },
        },
      },
    };

    if (pde) {
      query = { id: pde };
    }

    const points = await this.pointRepository.find({
      where: query,
      relations: {
        address: { parish: { canton: { province: { region: true } } } },
        facilitator_employee: true,
        manager_employee: true,
        coordinator_employee: true,
        technical_asistent_employee: true,
      },
    });

    //console.log('POINTS', points);

    let pdes = [];

    points?.forEach((p) => {
      pdes.push(p.facilitator_employee?.id);
      pdes.push(p.manager_employee?.id);
      pdes.push(p.coordinator_employee?.id);
      pdes.push(p.technical_asistent_employee?.id);
    });

    if (pdes?.length === 0) {
      pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
    }
    try {
      let objResult: ResultDashboardDTO = {
        data: [],
      };
      let objResultDefault: ResultDashboardDTO = {
        data: [{ name: 'Sin bienes', value: 0 }],
      };
      const assets = await this.assetsRepository
        .createQueryBuilder('asset')
        .leftJoinAndSelect('asset.type', 'type')
        .leftJoinAndSelect('asset.responsible_employee', 'responsible_employee')
        .where('responsible_employee.id IN (:...pdes)', { pdes })
        .getMany();

      assets.forEach((asset) => {
        let index = -1;
        if (asset) {
          objResult?.data?.find((element, i) => {
            if (element?.name === String(asset?.type)) {
              index = i;
              return true;
            }
          });
        }
        if (index > -1) {
          objResult.data[index].value++;
        } else {
          objResult.data.push({ name: asset?.type?.name, value: 1 });
        }
      });
      //console.log(objResult);

      // const result = await this.bienesPorTipoRepository.find();

      // if (result.length > 0) {
      //   for (const iterator of result) {
      //     objResult.data.push({
      //       name: iterator.tipo,
      //       value: +iterator.cantidad,
      //     });
      //   }
      // }
      return objResult.data.length > 0 ? objResult : objResultDefault;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de bienes por tipo y estado
  // Falta por integrar bien

  async getAssetsByStatusAndType(filters: any): Promise<any> {
    const { pde, month, year, parish, canton, province, region } = filters;

    let queryBuilder = this.assetsRepository
      .createQueryBuilder('asset')
      .leftJoin('asset.type', 'type')
      .leftJoin('asset.responsible_employee', 'responsible_employee')
      .select('type.category AS asset_type, asset.status, COUNT(*) AS count')
      .groupBy('type.category, asset.status');

    if (pde || parish || canton || province || region) {
      let query: any = {
        address: {
          parish: {
            ...(parish && { id: parish }),
            canton: {
              ...(canton && { id: canton }),
              province: {
                ...(province && { id: province }),
                ...(region && { region: { id: region } }),
              },
            },
          },
        },
      };

      if (pde) {
        query = { id: pde };
      }

      const points = await this.pointRepository.find({
        where: query,
        relations: {
          address: { parish: { canton: { province: { region: true } } } },
          facilitator_employee: true,
          manager_employee: true,
          coordinator_employee: true,
          technical_asistent_employee: true,
        },
      });

      //console.log('POINTS', points);

      let pdes = [];

      points?.forEach((p) => {
        pdes.push(p.facilitator_employee?.id);
        pdes.push(p.manager_employee?.id);
        pdes.push(p.coordinator_employee?.id);
        pdes.push(p.technical_asistent_employee?.id);
      });

      if (pdes?.length === 0) {
        pdes.push('b32804d0-567f-430d-9014-11856957cfbc');
      }
      queryBuilder.andWhere('responsible_employee.id IN (:...pdes)', { pdes });
    }

    const assetTypes = ['Mobiliario', 'Tecnologico']; // Replace with your asset types
    const assetStatuses = Object.values(ASSET_STATUS); // Get all asset statuses from the enum

    const data = {
      label: assetTypes,
      series: assetStatuses.map((status) => ({
        name: status,
        data: Array(assetTypes.length).fill(0),
      })),
    };

    try {
      const result = await queryBuilder.getRawMany();

      //console.log(result);

      for (const row of result) {
        const categoryIndex = data.label.indexOf(row.asset_type);
        const statusIndex = data.series.findIndex(
          (series) => series.name === row.status,
        );
        if (categoryIndex !== -1 && statusIndex !== -1) {
          data.series[statusIndex].data[categoryIndex] = parseInt(row.count);
        }
      }
    } catch (error) {
      console.log(error);
      console.error('Error al obtener los datos de la base de datos:', error);
    }

    return data;
  }

  // Total de visitas y capacitaciones por provincias
  // Falta por integrar bien
  public async totalVisitsAndTrainingByProvincesDashboard(
    filters: FilterCardsDashboardDTO,
  ): Promise<ResultWithLabelDashboardDTO | any | null> {
    try {
      let results =
        await this.totalVisitsAndTrainingsByProvinceRepository.find();
      const visitTypes = await this.visitTypesRepo.find();

      results.sort((a, b) => {
        return b.total_visits - a.total_visits;
      });

      let provinces = [];

      results.forEach((res) => {
        if (!provinces.find((p) => p === res.province_name))
          provinces.push(res.province_name);
      });

      let data = {
        label: provinces,
        series: [],
      };

      visitTypes.forEach((visitType) => {
        data.series.push({
          name: visitType?.name,
          data: [],
          type_id: visitType?.id,
        });
      });

      data.series.forEach((serie) => {
        const seriesData = results.filter((r) => r.type_id === serie.type_id);
        data.label.forEach((l, i) => {
          serie.data[i] = 0;

          seriesData.forEach((dt) => {
            if (dt.province_name === l) {
              serie.data[i] += +dt.total_virtual_visits;
            }
          });
        });
      });

      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de PDE por provincias y estados
  public async totalPdeByProvincesAndStatesDashboard(
    filters: any,
  ): Promise<ResultWithLabelDashboardDTO | null> {
    try {
      const { pde, parish, canton, province, region } = filters;

      let query = {
        ...(region && { region_id: region }),
        ...(province && { province_id: province }),
        ...(canton && { canton_id: canton }),
        ...(parish && { parish_id: parish }),
        ...(pde && { point_id: pde }),
      };

      const puntosDeEncuentro =
        await this.totalPuntosDeEncuentroRepository.find({where: query});

      const provincias = [
        ...new Set(puntosDeEncuentro.map((punto) => punto.province_name)),
      ];
      const estados = [
        ...new Set(puntosDeEncuentro.map((punto) => punto.status_name)),
      ];

      const data = {
        label: provincias,
        series: [],
      };

      estados.forEach((estado) => {
        const estadoData = puntosDeEncuentro.filter(
          (punto) => punto.status_name === estado,
        );
        const cantidadPorProvincia = provincias.map(
          (provincia) =>
            estadoData.filter((punto) => punto.province_name === provincia)
              .length,
        );

        data.series.push({ name: estado, data: cantidadPorProvincia });
      });

      // Agregar valores por defecto y cantidades en 0 para provincias y estados que no tengan puntos de encuentro
      const provinciasSinPuntos = provincias.filter(
        (provincia) =>
          !puntosDeEncuentro.some((punto) => punto.province_name === provincia),
      );

      const estadosSinPuntos = estados.filter(
        (estado) =>
          !puntosDeEncuentro.some((punto) => punto.status_name === estado),
      );

      provinciasSinPuntos.forEach((provincia) => {
        data.label.push(provincia);
        estados.forEach((estado) => {
          data.series.push({
            name: estado,
            data: new Array(provincias.length).fill(0),
          });
        });
      });

      estadosSinPuntos.forEach((estado) => {
        data.series.push({
          name: estado,
          data: new Array(provincias.length).fill(0),
        });
      });

      return data;
      // const result: ResultWithLabelDashboardDTO = {
      //   label: ['AZUAY', 'BOLÍVAR', 'CAÑAR', 'CARCHI', 'CHIMBORAZO', 'COTOPAXI', 'EL ORO', 'ESMERALDAS', 'GALÁPAGOS', 'GUAYAS', 'IMBABURA', 'LOJA', 'LOS RÍOS', 'MANABI', 'MORONA SANTIAGO', 'NAPO', 'ORELLANA', 'PASTAZA', 'PICHINCHA', 'SANTA ELENA', 'SANTO DOMINGO DE LOS TSACHILAS', 'SUCUMBOS', 'TUNGURAHUA', 'ZAMORA CHINCHIPE'],
      //   series: [
      //       {name: "Activo",     data: [789, 854, 904, 354, 681, 124, 456, 456, 105, 998, 50, 120, 113, 154, 652, 871, 125, 654, 354, 54, 54, 245, 365, 896]},
      //       {name: "Inactivo",   data: [547, 654, 324, 245, 365, 896, 547, 56, 14, 198, 456, 456, 105, 998, 50, 120, 113, 154, 652, 871, 904, 354, 681, 124]},
      //       {name: "Suspendido", data: [50, 120, 113, 154, 652, 871, 125, 654, 354, 54, 245, 365, 896, 547, 56, 14, 198, 456, 456, 105, 56, 14, 198, 456]}
      //   ]
      // };
      // return result
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de operatividad de PDE por estados
  public async totalOperationOfPdeByStatesDashboard(): Promise<ResultDashboardDTO | null> {
    try {
      const results = await this.pointsByStatusViewRepository.find();

      // Crear el formato de respuesta deseado
      if (results.length > 0) {
        const data = results.map((result) => ({
          name: result.status_name || 'Sin estado',
          value: result.count || 0,
        }));
        return { data };
      } else {
        const result: ResultDashboardDTO = {
          data: [{ name: 'Sin Estado', value: 0 }],
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
