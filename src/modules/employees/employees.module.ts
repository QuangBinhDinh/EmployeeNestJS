import { Module } from '@nestjs/common';
import { EmployeesController } from '@modules/employees/employees.controller';
import { EmployeesService } from '@modules/employees/employees.service';
import { EmployeesRepository } from '@modules/employees/employees.repository';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository],
  exports: [EmployeesRepository],
})
export class EmployeesModule {}
