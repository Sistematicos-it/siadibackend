import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
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
import { STATUS_IN_PLANNING } from 'src/constants/enums';
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
import { VisitTypeEntity } from 'src/modules/visit-type/entities/visit-type.entity';
import { TotalVisitsAndTrainingsByProvinceViewEntity } from '../entities/total_visitas_capacitaciones_por_provincias.entity';
import { TotalPuntosDeEncuentroPorProvinciaYEstadoEntity } from '../entities/total-puntos-por-provincia-y-estado.entity';
import { TotalPointsByStatusView } from '../entities/total-punto-por-estados.entity';
import { AssetStatusByTypeAndStatusViewEntity } from '../entities/tota-bienes-tipos-estados-view.entity';
import { calcularPorcentaje } from 'src/utils/helpers';
// import { TotalConectividadByTecnologyAndSpeedViewEntity } from '../entities/total-conectividad-por-tecnologia-velocidad.entity';
import { ConectivityEntity } from 'src/modules/conectivity/entities/conectivity.entity';


@Injectable()
export class DashboardServiceMobile {
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
    private bienesPorTipoyEstadoRepository: Repository<AssetStatusByTypeAndStatusViewEntity>,

    @InjectRepository(TotalConectividadViewEntity)
    private totalConectividadRepository: Repository<TotalConectividadViewEntity>,

    @InjectRepository(TotalVisitantesPorProvinciasViewEntity)
    private totalVisitantesPorProvinciasRepository: Repository<TotalVisitantesPorProvinciasViewEntity>,

    @InjectRepository(TotalIncidentsByStatusViewEntity)
    private totalIncidentsByStatusViewRepository: Repository<TotalIncidentsByStatusViewEntity>,

    // @InjectRepository(TotalConectividadByTecnologyAndSpeedViewEntity)
    // private readonly totalConectividadByTecnologyAndSpeedViewRepository: Repository<TotalConectividadByTecnologyAndSpeedViewEntity>,
    
    @InjectRepository(TotalVisitsAndTrainingsByProvinceViewEntity)
    private readonly totalVisitsAndTrainingsByProvinceRepository: Repository<TotalVisitsAndTrainingsByProvinceViewEntity>,

    @InjectRepository(VisitTypeEntity)
    private readonly visitTypesRepo: Repository<VisitTypeEntity>,

    @InjectRepository(TotalPuntosDeEncuentroPorProvinciaYEstadoEntity)
    private readonly totalPuntosDeEncuentroRepository: Repository<TotalPuntosDeEncuentroPorProvinciaYEstadoEntity>,

    @InjectRepository(TotalPointsByStatusView)
    private readonly pointsByStatusViewRepository: Repository<TotalPointsByStatusView>,

    @InjectRepository(ConectivityEntity)
    private readonly conectivityRepository: Repository<ConectivityEntity>,

    private readonly fileService: FileService,
  ) {}
  // tarjetas
  public async getInfoCardDashboardMobile( filters: any ): Promise<ResultInfoCardDashboardDTO | any | null> {
    try {
      const {pde, month, year} = filters
      
      const queryBuilder = this.totalGeneralViewRepository.createQueryBuilder('total_general_view');
      queryBuilder
        .select('total_general_view.value', 'value')
        .addSelect('SUM(total_general_view.cantidad)', 'cant')
        .groupBy('total_general_view.value');

      // Verificar si 'pde' tiene valor antes de agregar la cláusula WHERE
      if (pde) {
        queryBuilder.andWhere('total_general_view.point_id = (:pde)', { pde });
      }

      // Verificar si 'mes' tiene valor antes de agregar la cláusula WHERE
      if (month) {
        queryBuilder.andWhere('total_general_view.mes = (:mes)', { month });
      }

      // Verificar si 'anno' tiene valor antes de agregar la cláusula WHERE
      if (year) {
        queryBuilder.andWhere('total_general_view.anno = (:anno)', { year });
      }

      const result = await queryBuilder.getRawMany();

      // const result = await queryBuilder.getRawMany();
      let totalViews = 0
      let totalTrainings = 0
      let totalVirtualTrainings = 0
      let totalVisitors = 0
      for (const iterator of result) {
        if (iterator.value === 'totalViews') {
          totalViews = iterator.cant
        }
        if (iterator.value === 'ON_SITE') {
          totalTrainings = iterator.cant
        }
        if (iterator.value === 'VIRTUAL') {
          totalVirtualTrainings = iterator.cant
        }
        if (iterator.value === 'totalVisitors') {
          totalVisitors = iterator.cant
        }
      }
        
      return {
        data: {
          totalViews,
          totalTrainings,
          totalVirtualTrainings,
          totalVisitors
        }
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  // Total de visitas y capacitaciones por género
  public async totalVisitAndTrainingByGenderDashboardMobile(filters: any): Promise<ResultDashboardDTO | any | null> {
    try {
      const {pde, month, year} = filters
      const queryBuilder = this.totalVisitantesPorGeneroRepository
      .createQueryBuilder('total_visitantes_por_genero')
      .select('genero')
      .addSelect('SUM(cantidad)', 'cant');

        if (pde) {
          queryBuilder.andWhere('total_visitantes_por_genero.point_id = (:pde)', { pde });
        }

        if (month) {
          queryBuilder.andWhere('total_visitantes_por_genero.mes = (:month)', { month });
        }

        if (year) {
          queryBuilder.andWhere('total_visitantes_por_genero.anno = (:year)', { year });
        }

        queryBuilder.groupBy('genero');
        const result = await queryBuilder.getRawMany();
        const objResult: ResultDashboardDTO = {
          data: [
            { value: 0, name: 'Hombres' },
            { value: 0, name: 'Mujeres' }
          ],
        }
        if (result.length > 0) {
          for (const iterator of result) {
            if (iterator.genero === 'M') {
              objResult.data[0].value = +iterator.cant
            }
            if (iterator.genero === 'F') {
              objResult.data[1].value = +iterator.cant
            }
          }
        }
      return objResult
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de visitas y capacitaciones por etnias
  public async totalVisitAndTrainingByEthnicityDashboardMobile(filters: any): Promise<ResultDashboardDTO |any | null> {
    try {
      const {pde, month, year} = filters
      const queryBuilder = this.totalVisitantesPorEtniaRepository
      .createQueryBuilder('total_visitantes_por_etnia')
      .select('etnia')
      .addSelect('SUM(cantidad)', 'cant');

      if (pde) {
        queryBuilder.where('point_id = (:pde)', { pde });
      }

      if (month) {
        queryBuilder.andWhere('mes = (:month)', { month });
      }

      if (year) {
        queryBuilder.andWhere('anno = (:year)', { year });
      }

      queryBuilder.groupBy('etnia');

      const result = await queryBuilder.getRawMany();
      const objResult: ResultDashboardDTO = {
        data: [
          { value: 0, name: 'Afroecuatoriana' },
          { value: 0, name: 'Mestiza' },
          { value: 0, name: 'Indígena' },
          { value: 0, name: 'Blanca' },
          { value: 0, name: 'Montubia' },
        ],
      }
      if (result.length > 0) {
        for (const iterator of result) {
          if (iterator.etnia === 'Afro-Ecuatoriano') {
            objResult.data[0].value = +iterator.cant
          }
          if (iterator.etnia === 'Mestizo') {
            objResult.data[1].value = +iterator.cant
          }
          if (iterator.etnia === 'Indigena') {
            objResult.data[2].value = +iterator.cant
          }
          if (iterator.etnia === 'Blanco') {
            objResult.data[3].value = +iterator.cant
          }
          if (iterator.etnia === 'Montubia') {
            objResult.data[4].value = +iterator.cant
          }
        }
      }
      
      return objResult
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de Tikets por Estado
  public async totalTicketByStatusDashboardMobile(): Promise<ResultDashboardDTO | null> {
    try {
      const incidentsByStatus = await this.totalIncidentsByStatusViewRepository.find();
      
      for (const item of incidentsByStatus) {
        item.value = Number(item.value);
      }
      return {
        data: [...incidentsByStatus]
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de visitas y capacitaciones por rango de edad 
  public async totalVisitAndTrainingDashboardMobile(filters: any): Promise<ResultDashboardDTO | any | null> {
    try {
      const {pde, month, year} = filters

      // Consulta para obtener el total de visitas y capacitaciones sin aplicar filtros
      const totalQuery = this.totalVisitantesPorRangoEdadRepository
        .createQueryBuilder('total_visitantes_por_rango_edad')
        .select('SUM(cantidad)', 'total');
  
      if (pde) {
        totalQuery.andWhere('total_visitantes_por_rango_edad.point_id = :pde', { pde });
      }
  
      if (month) {
        totalQuery.andWhere('total_visitantes_por_rango_edad.mes = :month', { month });
      }
  
      if (year) {
        totalQuery.andWhere('total_visitantes_por_rango_edad.anno = :year', { year });
      }
  
      const totalResult = await totalQuery.getRawOne();

      const queryBuilder = this.totalVisitantesPorRangoEdadRepository
      .createQueryBuilder('total_visitantes_por_rango_edad')
      .select('denominacion')
      .addSelect('SUM(cantidad)', 'cant');

      if (pde) {
        queryBuilder.where('point_id = (:pde)', { pde });
      }

      if (month) {
        queryBuilder.andWhere('mes = (:mes)', { month });
      }

      if (year) {
        queryBuilder.andWhere('anno = (:anno)', { year });
      }

      queryBuilder.groupBy('denominacion');

      const result = await queryBuilder.getRawMany();

      console.log(result);
      
      const objResult: ResultDashboardDTO = {
        data: [
          { value: 0, name: 'Mujeres(menores)', denominacion: 'Menor de edad mujeres' },
          { value: 0, name: 'Hombres(mayores)', denominacion: 'Mayor de edad hombres' },
          { value: 0, name: 'Hombres(menores)', denominacion: 'Menor de edad hombres' },
          { value: 0, name: 'Mujeres(mayores)', denominacion: 'Mayor de edad mujeres' },
        ],
      }
      
      if (result.length > 0) {
        for (const iterator of result) {          
          const index = objResult.data.findIndex(item => item.denominacion === iterator.denominacion);
          if (index !== -1) {
            objResult.data[index].value = +iterator.cant;
            objResult.data[index].name = `${objResult.data[index].name} (${calcularPorcentaje(iterator.cant, totalResult.total)}%)`;
          }
        }
      }
      return objResult
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de conectividad por tecnología y velocidad
  // Falta por integrar bien
  public async totalConnectivityTecnologyAndSpeedDashboardMobile(filters: FilterCardsDashboardDTO): Promise<ResultWithLabelDashboardDTO |any| null> {
    
    try {
      interface FormattedListItem {
        labels: string;
        tipos: {
          tipo: string;
          valor: number;
        }[];
      }
      const {pde, month, year} = filters

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
    
    if (filters.year) {
      query.andWhere('YEAR(connectivity.date) = :year', { year: filters.year });
    }
  
    if (filters.month) {
      query.andWhere('MONTH(connectivity.date) = :month', { month: filters.month });
    }
  
    // if (filters.region) {
    //   query.andWhere('region.name = :region', { region: filters.region });
    // }
  
    // if (filters.province) {
    //   query.andWhere('province.name = :province', { province: filters.province });
    // }
  
    // if (filters.canton) {
    //   query.andWhere('canton.name = :canton', { canton: filters.canton });
    // }
  
    // if (filters.parish) {
    //   query.andWhere('parish.name = :parish', { parish: filters.parish });
    // }
  
    // Agregar los filtros pde, year y month
    if (filters.pde) {
      query.andWhere('point.id = :pde', { pde: filters.pde });
    }
  
    const result = await query.getRawMany();
      
      const formattedList: FormattedListItem[] = [];

      result.forEach((item) => {
        const existingItem = formattedList.find((formattedItem) => formattedItem.labels === item.speed_name);
  
        if (existingItem) {
          const technologyExists = existingItem.tipos.find((tipo) => tipo.tipo === item.technology_name);
          if (technologyExists) {
            technologyExists.valor += 1; // Incrementa el contador
          } else {
            existingItem.tipos.push({ tipo: item.technology_name, valor: 1 }); // Agrega un nuevo tipo
          }
        } else {
          formattedList.push({
            labels: item.speed_name,
            tipos: [{ tipo: item.technology_name, valor: 1 }], // Inicia el contador en 1
          });
        }
      });

      return formattedList;

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async totalConnectivityTecnologyAndSpeedDashboard(
    filters: FiltersDTO,
  ): Promise<{ label: string[]; series: { name: string; data: number[] }[] } | any> {
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
    
    if (filters.year) {
      query.andWhere('YEAR(connectivity.date) = :year', { year: filters.year });
    }
  
    if (filters.month) {
      query.andWhere('MONTH(connectivity.date) = :month', { month: filters.month });
    }
  
    if (filters.region) {
      query.andWhere('region.name = :region', { region: filters.region });
    }
  
    if (filters.province) {
      query.andWhere('province.name = :province', { province: filters.province });
    }
  
    if (filters.canton) {
      query.andWhere('canton.name = :canton', { canton: filters.canton });
    }
  
    if (filters.parish) {
      query.andWhere('parish.name = :parish', { parish: filters.parish });
    }
  
    // Agregar los filtros pde, year y month
    if (filters.pde) {
      query.andWhere('point.id = :pde', { pde: filters.pde });
    }
  
    const result = await query.getRawMany();
    const totalItems = await this.conectivityRepository.count()
  
    const data = {
      label: [],
      series: [],
    };
    
    console.log(result);
    
    const speedNames = [...new Set(result.map(item => item.speed_name))];
    const technologyNames = [...new Set(result.map(item => item.technology_name))];
    
    speedNames.forEach(speedName => {
      const seriesValues = [];
      
      technologyNames.forEach(technologyName => {
        const totalCount = result.filter(item => item.speed_name === speedName && item.technology_name === technologyName).length;
        const totalByTecnology = result.filter(item => item.technology_name === technologyName).length
        
        technologyName = `${technologyName} (${calcularPorcentaje(totalByTecnology, totalItems)})`
        data.label = [...data.label, technologyName]
        seriesValues.push(totalCount);
      });

        data.label = [...new Set(data.label.map(item => item))];
        data.series.push({ name: speedName, data: seriesValues });
    });

    return data;
  }

  // Total de documentos subidos por tipo
  public async totalDocUpByTypeDashboardMobile(idCategory: string): Promise<ResultDashboardDTO | null> {
    try {
      const result: ResultDashboardDTO = {
        data: [
        ]
      };
      const filesResult = await this.fileService.getFilesCountByCategory(idCategory)
      for (const iterator of filesResult) {
        result.data.push({name: iterator.category, value: +iterator.count})
      }
      return result.data.length > 0 ? result : {
      data: [
        {name: "Sin Categoría", value: 0},
      ]
    }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de bienes por tipo
  public async totalAssetsByTypeDashboardMobile(): Promise<ResultDashboardDTO | any | null> {
    try {
      const objResultDefault: ResultDashboardDTO = {
        data: [
          {name: 'Sin bienes', value: 0},
        ]
      };
      const objResult: ResultDashboardDTO = {
        data: []
      };
      const result = await this.bienesPorTipoRepository.find();

      if (result.length > 0) {
        for (const iterator of result) {
          objResult.data.push({
            name: iterator.tipo,
            value: +iterator.cantidad
          })
        }
      }
      return objResult.data.length > 0 ? objResult : objResultDefault
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  // Total de bienes por tipo y estado 
  // Falta por integrar bien
  public async totalAssetsByTypeAndStatusDashboardMobile(): Promise<ResultWithLabelDashboardDTO | any> {
    try {
      interface AssetInfo {
        asset_type: string;
        status: string;
        count: string;
      }
      
      interface FormattedData {
        labels: string;
        tipos: { tipo: string; valor: number }[];
      }
      const result = await this.bienesPorTipoyEstadoRepository.find();
      const formattedList: FormattedData[] = [];

  for (const item of result) {
    const existingLabelIndex = formattedList.findIndex((x) => x.labels === item.status);

    if (existingLabelIndex === -1) {
      formattedList.push({
        labels: item.status,
        tipos: [{ tipo: item.asset_type, valor: item.count }],
      });
    } else {
      formattedList[existingLabelIndex].tipos.push({
        tipo: item.asset_type,
        valor: item.count,
      });
    }
  }

  return formattedList;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de visitas y capacitaciones por provincias 
  // Falta por integrar bien
  public async totalVisitsAndTrainingByProvincesDashboardMobile(filters: any): Promise<ResultWithLabelDashboardDTO |any| null> {
    try {
      const result = await this.totalVisitsAndTrainingsByProvinceRepository.find();
      const groupedData = {};

      result.forEach((item) => {
        const { province_name, total_visits, total_capacitations, total_virtual_visits } = item;

        const labels = ['total_visits', 'total_capacitations', 'total_virtual_visits'];

        labels.forEach((label) => {
          if (!groupedData[label]) {
            groupedData[label] = {
              labels: label,
              tipos: [],
            };
          }

          const tipoIndex = groupedData[label].tipos.findIndex((tipo) => tipo.tipo === province_name);

          let valor = 0;
          if (label === 'total_visits') {
            valor = +total_visits;
          } else if (label === 'total_capacitations') {
            valor = +total_capacitations;
          } else if (label === 'total_virtual_visits') {
            valor = +total_virtual_visits;
          }

          if (tipoIndex === -1) {
            groupedData[label].tipos.push({ tipo: province_name, valor });
          } else {
            groupedData[label].tipos[tipoIndex].valor += valor;
          }
        });
      });

      return Object.values(groupedData);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de PDE por provincias y estados 
  public async totalPdeByProvincesAndStatesDashboardMobile(): Promise<ResultWithLabelDashboardDTO | any | null> {
    try {
      const results = await this.totalPuntosDeEncuentroRepository.find();

      const groupedData = {};

      results.forEach((item) => {
        const { status_name, province_name } = item;

        if (!groupedData[status_name]) {
          groupedData[status_name] = {
            labels: status_name.toLowerCase(),
            tipos: [],
          };
        }

        const tipoIndex = groupedData[status_name].tipos.findIndex((tipo) => tipo.tipo === province_name);

        if (tipoIndex === -1) {
          groupedData[status_name].tipos.push({ tipo: province_name, valor: 1 });
        } else {
          groupedData[status_name].tipos[tipoIndex].valor++;
        }
      });

      return Object.values(groupedData);

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  // Total de operatividad de PDE por estados
  public async totalOperationOfPdeByStatesDashboardMobile(): Promise<ResultDashboardDTO | null> {
    try {
      const results = await this.pointsByStatusViewRepository.find();
      
      // Crear el formato de respuesta deseado
      if (results.length > 0) {
        const data = results.map((result) => ({
          name: result.status_name || 'Sin estado',
          value: +result.count || 0,
        }));
        return {data};
      } else {
        const result: ResultDashboardDTO = {
          data: [
            {name: "Sin Estado", value: 0},
          ]
        };
        return result
      }

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
