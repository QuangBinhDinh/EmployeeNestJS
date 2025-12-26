import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { CreateEmployeeRequest } from './dto/request/create-employee.request';
import { UpdateEmployeeRequest } from './dto/request/update-employee.request';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { Employee } from './employees.schema';

export interface PaginatedEmployees {
  items: Employee[];
  totalCount: number;
}

@Injectable()
export class EmployeesService {
  public constructor(private readonly employeesRepository: EmployeesRepository) {}

  public async findAll(
    pageId?: number,
    pageSize?: number,
  ): Promise<Employee[] | PaginatedEmployees> {
    // If pagination params are provided
    if (pageId !== undefined && pageSize !== undefined) {
      const offset = (pageId - 1) * pageSize;
      const [employees, totalCount] = await Promise.all([
        this.employeesRepository.findAll(pageSize, offset),
        this.employeesRepository.count(),
      ]);

      return {
        items: employees,
        totalCount,
      };
    }

    // Default behavior without pagination
    return this.employeesRepository.findAll(DEFAULT_PAGE_SIZE, 0);
  }

  public async findOne(empNo: number): Promise<Employee> {
    const employee = await this.employeesRepository.findOne(empNo);

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }
    return employee;
  }

  public async create(request: CreateEmployeeRequest): Promise<Employee> {
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
  }

  public async update(empNo: number, request: UpdateEmployeeRequest): Promise<Employee> {
    const updateData: any = {};

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
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }

    return this.findOne(empNo);
  }

  public async remove(empNo: number): Promise<void> {
    const affectedRows = await this.employeesRepository.remove(empNo);

    if (affectedRows === 0) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }
  }
}
