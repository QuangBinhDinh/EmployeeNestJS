import { Module } from '@nestjs/common';
import { DepartmentsController } from '@modules/departments/departments.controller';
import { DepartmentsService } from '@modules/departments/departments.service';
import { DepartmentsRepository } from '@modules/departments/departments.repository';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService, DepartmentsRepository],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule {}
