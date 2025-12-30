import { Injectable } from '@nestjs/common';
import { DepartmentsRepository } from '@modules/departments/departments.repository';
import { CreateDepartmentRequest, UpdateDepartmentRequest } from '@modules/departments/dto';
import { DEFAULT_PAGE_SIZE } from '@common/constants/pagination.constants';
import { Department } from '@modules/departments/departments.schema';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Injectable()
export class DepartmentsService {
  public constructor(
    private readonly departmentsRepository: DepartmentsRepository,
    private readonly paginationMetadata: PaginationMetadata,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<Department[]> {
    // If pagination params are provided
    if (pageId !== undefined && pageSize !== undefined) {
      const offset = (pageId - 1) * pageSize;
      const [departments, totalCount] = await Promise.all([
        this.departmentsRepository.findAll(pageSize, offset),
        this.departmentsRepository.count(),
      ]);

      // Set metadata for interceptor to use
      this.paginationMetadata.setTotalCount(totalCount);

      return departments;
    }

    // Default behavior without pagination
    return this.departmentsRepository.findAll(DEFAULT_PAGE_SIZE, 0);
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
      return createdRow;
    } catch (e) {
      handleServiceError(e, 'Failed to create department');
    }
  }

  public async update(deptNo: string, request: UpdateDepartmentRequest): Promise<Department> {
    try {
      const updatedRow = await this.departmentsRepository.update(deptNo, request);
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
    } catch (e) {
      handleServiceError(e, 'Failed to delete department');
    }
  }
}
