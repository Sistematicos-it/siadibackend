import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.sources';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseSeederAdminUserService } from './modules/users/services/dataBaseSeederAdminUser.service';
import { EmailModule } from './modules/email/email.module';
import { GeolocationModule } from './modules/nomencladores/geolocation/geolocation.module';
import { PersonDataModule } from './modules/nomencladores/person-data/person-data.module';
import { WorkOrdersConnectivityModule } from './modules/nomencladores/workorders-connectivity/workorders-connectivity.module';
import { PermissionTypeModule } from './modules/nomencladores/permissions-data/permissions-data.module';

import { RolesModule } from './modules/roles/roles.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { SpecializationsModule } from './modules/nomencladores/specializations/specializations.module';
import { DatabaseSeederRolesService } from './modules/roles/services/databaseSeederRoles.service';
import { ProfessionalTitleModule } from './modules/nomencladores/professional-title/professional-title.module';
import { EducationLevelModule } from './modules/nomencladores/education-level/education-level.module';
import { InstitutionsModule } from './modules/nomencladores/institution/institution.module';
import { PoliticalLinesModule } from './modules/nomencladores/political-line/political-line.module';
import { BeneficiaryTypesModule } from './modules/nomencladores/beneficiary-type/beneficiary-type.module';
import { AssetTypesModule } from './modules/nomencladores/asset-type/asset-type.module';
import { PointStatusModule } from './modules/nomencladores/point-status/point-status.module';
import { BeneficiaryModule } from './modules/beneficiary/beneficiary.module';
import { PointModule } from './modules/points/point.module';
import { CitizenModule } from './modules/citizen/citizen.module';
import { WebSiteModule } from './modules/nomencladores/web-site/website.module';
import { AssetModule } from './modules/asset/asset.module';
import { IncidentIssuessModule } from './modules/nomencladores/incident-issues/incident-issues.module';
import { EquipmentsModule } from './modules/nomencladores/equipment/equipment.module';
import { ComponentsModule } from './modules/nomencladores/component/component.module';
import { ReportsModule } from './modules/nomencladores/reports/report.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FaceToFaceTrainingsModule } from './modules/nomencladores/face-to-face-training/face-to-face-training.module';
import { CertificatesModule } from './modules/nomencladores/certifcate/certificate.module';
import { CoursesModule } from './modules/course/course.module';
import { ProgramsModule } from './modules/nomencladores/program/program.module';
import { FilesModule } from './modules/file/file.module';
import { IncidentsModule } from './modules/incident/incident.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { ConectivitysModule } from './modules/conectivity/conectivity.module';
import { PlanningEntity } from './modules/planning/entities/planning.entity';
import { PlanningsModule } from './modules/planning/planning.module';
import { DatabaseSeederVisitTypeService } from './modules/visit-type/services/visit-type.seeder.service';
import { VisitTypeModule } from './modules/visit-type/visit-type.module';
import { VisitRecordModule } from './modules/visit-record/visit-record.module';
import { SecuritysModule } from './modules/security/security.module';
import { DatabaseSeederPointStatusService } from './modules/nomencladores/point-status/services/databaseSeederPointStatus.service';
import { PermissionRequestModule } from './modules/permissionRequest/permission-request.module';
import { DashboardsModule } from './modules/dashboard/dashboard.module';
import { CertificateExchangeModule } from './modules/certificate-exchange/certificate-exchange.module';
import { ConnectionLogssModule } from './modules/connection-logs/connection-logs.module';
import { LoginReasonOfVisitModule } from './modules/login-reason-visit/login-reason-visit.module';
import { CourseCatalogModule } from './modules/nomencladores/course-catalog/course-catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ //Esto es para en mi package.json asignarle el valor del entorno que se va a usar ej. develop
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    AuthModule,
    UsersModule,
    EmailModule,
    GeolocationModule,
    PersonDataModule,
    WorkOrdersConnectivityModule,
    PermissionTypeModule,
    RolesModule,
    EmployeeModule,
    SpecializationsModule,
    ProfessionalTitleModule,
    EducationLevelModule,
    InstitutionsModule,
    PoliticalLinesModule,
    BeneficiaryTypesModule,
    AssetTypesModule,
    PointStatusModule,
    BeneficiaryModule,
    PointModule,
    CitizenModule,
    WebSiteModule,
    AssetModule,
    IncidentIssuessModule,
    EquipmentsModule,
    ComponentsModule,
    ReportsModule,
    FaceToFaceTrainingsModule,
    CertificatesModule,
    CoursesModule,
    ProgramsModule,
    AttendanceModule,
    FilesModule,
    IncidentsModule,
    WorkOrderModule,
    ConectivitysModule,
    PlanningsModule,
    VisitTypeModule,
    VisitRecordModule,
    SecuritysModule,
    PermissionRequestModule,
    DashboardsModule,
    CertificateExchangeModule,
    ConnectionLogssModule,
    LoginReasonOfVisitModule,
    CourseCatalogModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly userAdminService: DatabaseSeederAdminUserService,
    // private readonly timerService: DatabaseSeederTimerService,
    private readonly roleSeedService: DatabaseSeederRolesService,

    private readonly visitTypeSeedService: DatabaseSeederVisitTypeService,

    private readonly pointStatusSeedService: DatabaseSeederPointStatusService,
  ) {}

  async onModuleInit() {
    const adminRole = await this.roleSeedService.seedRoles();
    await this.userAdminService.seedAdminUser(adminRole);
    await this.visitTypeSeedService.seedVisitTypes();
    await this.pointStatusSeedService.seedStatus();
  }
}
