import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeesRepository } from './employees.repository';
import { CreateEmployeeRequest } from './dto/request/create-employee.request';
import { UpdateEmployeeRequest } from './dto/request/update-employee.request';
import { GetEmployeeResponse } from './dto/response/get-employee.response';

@Injectable()
export class EmployeesService {
  public constructor(private readonly employeesRepository: EmployeesRepository) {}

  public async findAll(limit: number = 10, offset: number = 0): Promise<GetEmployeeResponse[]> {
    const employees = await this.employeesRepository.findAll(limit, offset);
    return employees.map((emp) => this.mapToResponse(emp));
  }

  public async findOne(empNo: number): Promise<GetEmployeeResponse> {
    const employee = await this.employeesRepository.findOne(empNo);

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }

    return this.mapToResponse(employee);
  }

  public async create(request: CreateEmployeeRequest): Promise<GetEmployeeResponse> {
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

  public async update(empNo: number, request: UpdateEmployeeRequest): Promise<GetEmployeeResponse> {
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

  private mapToResponse(employee: any): GetEmployeeResponse {
    return {
      empNo: employee.empNo,
      birthDate:
        employee.birthDate instanceof Date
          ? employee.birthDate.toISOString().split('T')[0]
          : employee.birthDate,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: employee.gender,
      hireDate:
        employee.hireDate instanceof Date
          ? employee.hireDate.toISOString().split('T')[0]
          : employee.hireDate,
    };
  }
}
