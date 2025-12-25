import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { Employee, NewEmployee } from '../db/schema';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database<typeof schema>,
  ) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<Employee[]> {
    return await this.db
      .select()
      .from(schema.employees)
      .limit(limit)
      .offset(offset);
  }

  async findOne(empNo: number): Promise<Employee> {
    const result = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.empNo, empNo))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }

    return result[0];
  }

  async create(employee: any): Promise<Employee> {
    const employeeData = {
      ...employee,
      birthDate: new Date(employee.birthDate),
      hireDate: new Date(employee.hireDate),
    };
    await this.db.insert(schema.employees).values(employeeData);
    return this.findOne(employee.empNo);
  }

  async update(empNo: number, employee: any): Promise<Employee> {
    const updateData: any = { ...employee };
    if (employee.birthDate) {
      updateData.birthDate = new Date(employee.birthDate);
    }
    if (employee.hireDate) {
      updateData.hireDate = new Date(employee.hireDate);
    }
    
    const result = await this.db
      .update(schema.employees)
      .set(updateData)
      .where(eq(schema.employees.empNo, empNo));

    if (result[0].affectedRows === 0) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }

    return this.findOne(empNo);
  }

  async remove(empNo: number): Promise<void> {
    const result = await this.db
      .delete(schema.employees)
      .where(eq(schema.employees.empNo, empNo));

    if (result[0].affectedRows === 0) {
      throw new NotFoundException(`Employee with ID ${empNo} not found`);
    }
  }
}

