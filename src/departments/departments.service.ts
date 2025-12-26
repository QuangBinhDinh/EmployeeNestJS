import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentRequest } from './dto/request/create-department.request';
import { UpdateDepartmentRequest } from './dto/request/update-department.request';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { Department } from './departments.schema';

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
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
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
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }

    return this.findOne(deptNo);
  }

  public async remove(deptNo: string): Promise<void> {
    const affectedRows = await this.departmentsRepository.remove(deptNo);

    if (affectedRows === 0) {
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }
  }
}
