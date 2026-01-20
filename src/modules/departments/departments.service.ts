import { Injectable, Logger } from '@nestjs/common';
import { DepartmentsRepository } from '@modules/departments/departments.repository';
import { CreateDepartmentRequest, UpdateDepartmentRequest } from '@modules/departments/dto';
import { Department } from '@modules/departments/departments.schema';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';
import { ExternalApiService } from '@modules/external-api';
import { RedisService } from '@modules/redis';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  public constructor(
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly paginationMetadata: PaginationMetadata,
    private readonly externalApiService: ExternalApiService,
    private readonly redisService: RedisService,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<Department[]> {
    // If pagination params are provided
    let pagination: { limit: number; offset: number } | undefined = undefined;
    if (pageId !== undefined && pageSize !== undefined) {
      const totalCount = await this.departmentsRepository.count();
      pagination = {
        limit: pageSize,
        offset: (pageId - 1) * pageSize,
      };
      this.paginationMetadata.setTotalCount(totalCount);
    }

    return this.departmentsRepository.findAll(pagination);
  }

  public async findOne(deptNo: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne(deptNo);

    if (!department) {
      throw new NotFoundError(`Department with ID ${deptNo}`);
    }

    return department;
  }

  public async create(request: CreateDepartmentRequest): Promise<Department> {
    try {
      const departmentData = {
        deptNo: request.deptNo,
        deptName: request.deptName,
      };

      const createdRow = await this.departmentsRepository.create(departmentData);

      // Publish event for real-time notifications
      await this.redisService.publish('department:created', {
        action: 'created',
        data: createdRow,
        timestamp: new Date().toISOString(),
      });

      return createdRow;
    } catch (e) {
      handleServiceError(e, 'Failed to create department');
    }
  }

  public async update(deptNo: string, request: UpdateDepartmentRequest): Promise<Department> {
    try {
      const updatedRow = await this.departmentsRepository.update(deptNo, request);

      // Publish event for real-time notifications
      await this.redisService.publish('department:updated', {
        action: 'updated',
        data: updatedRow,
        timestamp: new Date().toISOString(),
      });

      return updatedRow;
    } catch (e) {
      handleServiceError(e, 'Failed to update department');
    }
  }

  public async remove(deptNo: string): Promise<void> {
    try {
      const affectedRows = await this.departmentsRepository.remove(deptNo);
      if (affectedRows === 0) {
        throw new NotFoundError(`Department with ID ${deptNo}`);
      }

      // Publish event for real-time notifications
      await this.redisService.publish('department:deleted', {
        action: 'deleted',
        data: { deptNo },
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      handleServiceError(e, 'Failed to delete department');
    }
  }

  public async fetchExternal(): Promise<any> {
    try {
      const externalData = await this.externalApiService.get('posts');
      return externalData;
    } catch (e) {
      handleServiceError(e, 'Failed to fetch external');
    }
  }
}
