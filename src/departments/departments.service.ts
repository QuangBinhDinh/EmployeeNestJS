import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { Department, NewDepartment } from '../db/schema';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database<typeof schema>,
  ) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<Department[]> {
    return await this.db
      .select()
      .from(schema.departments)
      .limit(limit)
      .offset(offset);
  }

  async findOne(deptNo: string): Promise<Department> {
    const result = await this.db
      .select()
      .from(schema.departments)
      .where(eq(schema.departments.deptNo, deptNo))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }

    return result[0];
  }

  async create(department: NewDepartment): Promise<Department> {
    await this.db.insert(schema.departments).values(department);
    return this.findOne(department.deptNo);
  }

  async update(deptNo: string, department: Partial<NewDepartment>): Promise<Department> {
    const result = await this.db
      .update(schema.departments)
      .set(department)
      .where(eq(schema.departments.deptNo, deptNo));

    if (result[0].affectedRows === 0) {
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }

    return this.findOne(deptNo);
  }

  async remove(deptNo: string): Promise<void> {
    const result = await this.db
      .delete(schema.departments)
      .where(eq(schema.departments.deptNo, deptNo));

    if (result[0].affectedRows === 0) {
      throw new NotFoundException(`Department with ID ${deptNo} not found`);
    }
  }
}

