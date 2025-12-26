import { Injectable } from '@nestjs/common';
import { DepartmentsRepository } from '@modules/departments/departments.repository';
import { CreateDepartmentRequest } from '@modules/departments/dto/request/create-department.request';
import { UpdateDepartmentRequest } from '@modules/departments/dto/request/update-department.request';
import { DEFAULT_PAGE_SIZE } from '@common/constants/pagination.constants';
import { Department } from '@modules/departments/departments.schema';
import { NotFoundError } from '@common/exceptions/base.error';

@Injectable()
export class DepartmentsService {
  public constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  public async findAll(
    limit: number = DEFAULT_PAGE_SIZE,
    offset: number = 0,
  ): Promise<Department[]> {
    return this.departmentsRepository.findAll(limit, offset);
  }

  public async findOne(deptNo: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne(deptNo);

    if (!department) {
      throw new NotFoundError(`Department with ID ${deptNo}`);
    }

    return department;
  }

  public async create(request: CreateDepartmentRequest): Promise<Department> {
    const departmentData = {
      deptNo: request.deptNo,
      deptName: request.deptName,
    };

    await this.departmentsRepository.create(departmentData);
    return this.findOne(request.deptNo);
  }

  public async update(deptNo: string, request: UpdateDepartmentRequest): Promise<Department> {
    const updateData: any = {};

    if (request.deptName) {
      updateData.deptName = request.deptName;
    }

    const affectedRows = await this.departmentsRepository.update(deptNo, updateData);

    if (affectedRows === 0) {
      throw new NotFoundError(`Department with ID ${deptNo}`);
    }

    return this.findOne(deptNo);
  }

  public async remove(deptNo: string): Promise<void> {
    const affectedRows = await this.departmentsRepository.remove(deptNo);

    if (affectedRows === 0) {
      throw new NotFoundError(`Department with ID ${deptNo}`);
    }
  }
}
