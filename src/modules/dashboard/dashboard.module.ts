import { Global, Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';
import { TotalGeneralViewEntity } from './entities/total-general-view.entity';
import { TotalVisitantesPorGeneroEntity } from './entities/total-visitantes-por-genero-view.entity';
import { TotalVisitantesPorEtniaEntity } from './entities/total-visitas-por-etnia-view.entity';
import { TotalVisitantesPorRangoEdadEntity } from './entities/total-visitas-por-rango-de-edad.entity';
import { TotalBienesPorTipoViewEntity } from './entities/tota-bienes-por-tipos-view.entity';
import { TotalConectividadViewEntity } from './entities/total-conectividad-view.entity';
import { TotalVisitantesPorProvinciasViewEntity } from './entities/total-visitas-capacitaciones-provincias.view.entity';
import { TotalIncidentsByStatusViewEntity } from './entities/total-ticket-por-estado.entity';
// import { TotalConectividadByTecnologyAndSpeedViewEntity } from './entities/total-conectividad-por-tecnologia-velocidad.entity';
import { TotalVisitsAndTrainingsByProvinceViewEntity } from './entities/total_visitas_capacitaciones_por_provincias.entity';
import { TotalPuntosDeEncuentroPorProvinciaYEstadoEntity } from './entities/total-puntos-por-provincia-y-estado.entity';
import { TotalPointsByStatusView } from './entities/total-punto-por-estados.entity';
import { DashboardServiceMobile } from './services/dashboard-mobile.service';
import { DashboardControllerMobile } from './controllers/dashboard-mobile.controller';
import { AssetStatusByTypeAndStatusViewEntity } from './entities/tota-bienes-tipos-estados-view.entity';
import { ConectivityEntity } from '../conectivity/entities/conectivity.entity';
import { VisitRecordView } from './entities/visitRecordView.entity';
// import { TotalGeneralViewEntity } from './entities/total-general-view.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        TotalGeneralViewEntity,
        TotalVisitantesPorGeneroEntity,
        TotalVisitantesPorEtniaEntity,
        TotalVisitantesPorRangoEdadEntity,
        TotalBienesPorTipoViewEntity,
        TotalConectividadViewEntity,
        TotalVisitantesPorProvinciasViewEntity,
        TotalIncidentsByStatusViewEntity,
        // TotalConectividadByTecnologyAndSpeedViewEntity,
        TotalVisitsAndTrainingsByProvinceViewEntity,
        TotalPuntosDeEncuentroPorProvinciaYEstadoEntity,
        TotalPointsByStatusView,
        AssetStatusByTypeAndStatusViewEntity,
        ConectivityEntity,
        VisitRecordView
      ]  
    ),
  ],
  providers: [DashboardService, DashboardServiceMobile],
  controllers: [DashboardController, DashboardControllerMobile],
  exports: [DashboardService,TypeOrmModule],
})
export class DashboardsModule {}
