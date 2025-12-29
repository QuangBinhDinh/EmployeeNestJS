import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { EmployeesModule } from '@modules/employees/employees.module';
import { DepartmentsModule } from '@modules/departments/departments.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';

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
    AuthModule,
  ],
})
export class AppModule {}
