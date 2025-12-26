import { Module } from '@nestjs/common';
import { EmployeesController } from '@modules/employees/employees.controller';
import { EmployeesService } from '@modules/employees/employees.service';
import { EmployeesRepository } from '@modules/employees/employees.repository';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository, PaginationMetadata],
  exports: [EmployeesRepository],
})
export class EmployeesModule {}
