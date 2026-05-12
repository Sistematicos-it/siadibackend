import { Global, Module } from '@nestjs/common';
import { EmployeeService } from './services/employee.service';
import { EmployeeController } from './controllers/employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { EmployeePeriodsEntity } from './entities/employee_periods.entity';
import { RolesService } from '../roles/services/roles.service';
import { EmployeeCommandChainEntity } from './entities/employee_command_chain.entity';
import { EmployeeVulnerabilityPeriodEntity } from './entities/employee_vulnerability_period.entity';
import { EmployeeTransferEntity } from './entities/employee_transfer.entity';
import { UserRolesEntity } from '../users/entities/users-roles.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity, EmployeePeriodsEntity, EmployeeCommandChainEntity, UserRolesEntity, EmployeeVulnerabilityPeriodEntity, EmployeeTransferEntity])],
  providers: [EmployeeService, RolesService],
  controllers: [EmployeeController],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
