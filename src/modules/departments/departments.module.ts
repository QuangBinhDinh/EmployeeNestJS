import { Module } from '@nestjs/common';
import { DepartmentsController } from '@modules/departments/departments.controller';
import { DepartmentsService } from '@modules/departments/departments.service';
import { DepartmentsRepository } from '@modules/departments/departments.repository';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsService, DepartmentsRepository, PaginationMetadata],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule {}
