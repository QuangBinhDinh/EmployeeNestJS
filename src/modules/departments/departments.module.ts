import { Module } from '@nestjs/common';
import { DepartmentsController } from '@modules/departments/departments.controller';
import { DepartmentsService } from '@modules/departments/departments.service';
import { DepartmentsRepository } from '@modules/departments/departments.repository';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';
import { ExternalApiModule } from '../external-api';
import { DepartmentsGateway } from './departments.gateway';

@Module({
  imports: [ExternalApiModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, DepartmentsRepository, PaginationMetadata, DepartmentsGateway],
  exports: [DepartmentsRepository],
})
export class DepartmentsModule {}
