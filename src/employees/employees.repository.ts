import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { Employee } from '../db/schema';

@Injectable()
export class EmployeesRepository {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database<typeof schema>,
  ) {}

  public async findAll(limit: number, offset: number): Promise<Employee[]> {
    return await this.db.select().from(schema.employees).limit(limit).offset(offset);
  }

  public async findOne(empNo: number): Promise<Employee | null> {
    const result = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.empNo, empNo))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  public async create(employee: typeof schema.employees.$inferInsert): Promise<void> {
    await this.db.insert(schema.employees).values(employee);
  }

  public async update(
    empNo: number,
    employee: Partial<typeof schema.employees.$inferInsert>,
  ): Promise<number> {
    const result = await this.db
      .update(schema.employees)
      .set(employee)
      .where(eq(schema.employees.empNo, empNo));

    return result[0].affectedRows;
  }

  public async remove(empNo: number): Promise<number> {
    const result = await this.db.delete(schema.employees).where(eq(schema.employees.empNo, empNo));

    return result[0].affectedRows;
  }
}
