import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { EmployeesModule } from '@modules/employees/employees.module';
import { DepartmentsModule } from '@modules/departments/departments.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    EmployeesModule,
    DepartmentsModule,
    UsersModule,
  ],
})
export class AppModule {}
