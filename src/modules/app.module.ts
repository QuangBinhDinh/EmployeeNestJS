import { Module } from '@nestjs/common';
import { DatabaseModule } from '@config';
import { EmployeesModule } from '@modules/employees/employees.module';
import { DepartmentsModule } from '@modules/departments/departments.module';

@Module({
  imports: [DatabaseModule, EmployeesModule, DepartmentsModule],
})
export class AppModule {}
