import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentsRepository } from './departments.repository';
import { CreateDepartmentRequest } from './dto/request/create-department.request';
import { UpdateDepartmentRequest } from './dto/request/update-department.request';
import { GetDepartmentResponse } from './dto/response/get-department.response';

@Injectable()
export class DepartmentsService {
  public constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  public async findAll(limit: number = 10, offset: number = 0): Promise<GetDepartmentResponse[]> {
    const departments = await this.departmentsRepository.findAll(limit, offset);
    return departments.map((dept) => this.mapToResponse(dept));
  }

  public async findOne(deptNo: string): Promise<GetDepartmentResponse> {
    const department = await this.departmentsRepository.findOne(deptNo);

    if (!department) {
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }

    return this.mapToResponse(department);
  }

  public async create(request: CreateDepartmentRequest): Promise<GetDepartmentResponse> {
    const departmentData = {
      deptNo: request.deptNo,
      deptName: request.deptName,
    };

    await this.departmentsRepository.create(departmentData);
    return this.findOne(request.deptNo);
  }

  public async update(
    deptNo: string,
    request: UpdateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
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

  private mapToResponse(department: any): GetDepartmentResponse {
    return {
      deptNo: department.deptNo,
      deptName: department.deptName,
    };
  }
}
