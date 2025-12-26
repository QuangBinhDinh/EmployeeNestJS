import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from '@modules/employees/employees.repository';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '@modules/employees/dto';
import { DEFAULT_PAGE_SIZE } from '@common/constants/pagination.constants';
import { Employee } from '@modules/employees/employees.schema';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';

@Injectable()
export class EmployeesService {
  public constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly paginationMetadata: PaginationMetadata,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<Employee[]> {
    // If pagination params are provided
    if (pageId !== undefined && pageSize !== undefined) {
      const offset = (pageId - 1) * pageSize;
      const [employees, totalCount] = await Promise.all([
        this.employeesRepository.findAll(pageSize, offset),
        this.employeesRepository.count(),
      ]);

      // Set metadata for interceptor to use
      this.paginationMetadata.setTotalCount(totalCount);

      return employees;
    }

    // Default behavior without pagination
    return this.employeesRepository.findAll(DEFAULT_PAGE_SIZE, 0);
  }

  public async findOne(empNo: number): Promise<Employee> {
    const employee = await this.employeesRepository.findOne(empNo);

    if (!employee) {
      throw new NotFoundError(`Employee with ID ${empNo}`);
    }
    return employee;
  }

  public async create(request: CreateEmployeeRequest): Promise<Employee> {
    try {
      const employeeData = {
        empNo: request.empNo,
        birthDate: new Date(request.birthDate),
        firstName: request.firstName,
        lastName: request.lastName,
        gender: request.gender,
        hireDate: new Date(request.hireDate),
      };

      await this.employeesRepository.create(employeeData);
      return this.findOne(request.empNo);
    } catch (e) {
      handleServiceError(e, 'Failed to create employee');
    }
  }

  public async update(empNo: number, request: UpdateEmployeeRequest): Promise<Employee> {
    try {
      const updateData: Partial<Employee> = {};

      if (request.birthDate) {
        updateData.birthDate = new Date(request.birthDate);
      }
      if (request.firstName) {
        updateData.firstName = request.firstName;
      }
      if (request.lastName) {
        updateData.lastName = request.lastName;
      }
      if (request.gender) {
        updateData.gender = request.gender;
      }
      if (request.hireDate) {
        updateData.hireDate = new Date(request.hireDate);
      }

      const affectedRows = await this.employeesRepository.update(empNo, updateData);

      if (affectedRows === 0) {
        throw new NotFoundError(`Employee with ID ${empNo}`);
      }

      return this.findOne(empNo);
    } catch (e) {
      handleServiceError(e, 'Failed to update employee');
    }
  }

  public async remove(empNo: number): Promise<void> {
    try {
      const affectedRows = await this.employeesRepository.remove(empNo);

      if (affectedRows === 0) {
        throw new NotFoundError(`Employee with ID ${empNo}`);
      }
    } catch (e) {
      handleServiceError(e, 'Failed to delete employee');
    }
  }
}
