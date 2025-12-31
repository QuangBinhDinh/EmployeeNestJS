import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from '@modules/employees/employees.repository';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '@modules/employees/dto';
import { Employee } from '@modules/employees';
import { NotFoundError, handleServiceError } from '@common/exceptions';
import { PaginationMetadata } from '@common/services/pagination-metadata.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EmployeesService {
  public constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly paginationMetadata: PaginationMetadata,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async findAll(pageId?: number, pageSize?: number): Promise<Employee[]> {
    // If pagination params are provided
    let pagination: { limit: number; offset: number } | undefined = undefined;
    if (pageId !== undefined && pageSize !== undefined) {
      const totalCount = await this.employeesRepository.count();
      pagination = {
        limit: pageSize,
        offset: (pageId - 1) * pageSize,
      };
      this.paginationMetadata.setTotalCount(totalCount);
    }

    return this.employeesRepository.findAll(pagination);
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
      const empNo = await this.generateEmpNo();
      const employeeData = {
        empNo,
        birthDate: new Date(request.birthDate),
        firstName: request.firstName,
        lastName: request.lastName,
        gender: request.gender,
        hireDate: new Date(request.hireDate),
      };

      const newEmployee = await this.employeesRepository.create(employeeData);
      if (!newEmployee) {
        throw new NotFoundError('Employee creation failed');
      }

      this.eventEmitter.emit('send-mail', {
        title: 'New Employee Created',
        description: `Employee ${request.firstName} ${request.lastName} has been created.`,
      });
      return newEmployee;
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

      const updateRow = await this.employeesRepository.update(empNo, updateData);
      if (!updateRow) {
        throw new NotFoundError(`Employee with ID ${empNo}`);
      }
      return updateRow;
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

  public async findByGender(gender: 'M' | 'F'): Promise<Employee[]> {
    try {
      return this.employeesRepository.findByCondition({
        gender,
      });
    } catch (e) {
      handleServiceError(e, 'Failed to find employees by gender');
    }
  }

  private async generateEmpNo(): Promise<number> {
    const count = await this.employeesRepository.count();
    return 10001 + count;
  }
}
