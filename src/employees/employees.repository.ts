import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { employees, Employee } from './employees.schema';

@Injectable()
export class EmployeesRepository {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database,
  ) {}

  public async findAll(limit: number, offset: number): Promise<Employee[]> {
    return await this.db.select().from(employees).limit(limit).offset(offset);
  }

  public async findOne(empNo: number): Promise<Employee | null> {
    const result = await this.db
      .select()
      .from(employees)
      .where(eq(employees.empNo, empNo))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  public async create(employee: typeof employees.$inferInsert): Promise<void> {
    await this.db.insert(employees).values(employee);
  }

  public async update(
    empNo: number,
    employee: Partial<typeof employees.$inferInsert>,
  ): Promise<number> {
    const result = await this.db.update(employees).set(employee).where(eq(employees.empNo, empNo));

    return result[0].affectedRows;
  }

  public async remove(empNo: number): Promise<number> {
    const result = await this.db.delete(employees).where(eq(employees.empNo, empNo));

    return result[0].affectedRows;
  }
}
