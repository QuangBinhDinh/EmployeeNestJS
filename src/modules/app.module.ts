import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database';
import { EmployeesModule } from '@modules/employees/employees.module';
import { DepartmentsModule } from '@modules/departments/departments.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SendMailEventListener } from '@/events/listeners/sendmail.event';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    DatabaseModule,
    EmployeesModule,
    DepartmentsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [SendMailEventListener],
})
export class AppModule {}
