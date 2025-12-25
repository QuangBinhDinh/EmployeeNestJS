import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [DatabaseModule, EmployeesModule, DepartmentsModule],
})
export class AppModule {}

