import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import { departments, Department } from './departments.schema';

@Injectable()
export class DepartmentsRepository {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database,
  ) {}

  public async findAll(limit: number, offset: number): Promise<Department[]> {
    return await this.db.select().from(departments).limit(limit).offset(offset);
  }

  public async findOne(deptNo: string): Promise<Department | null> {
    const result = await this.db
      .select()
      .from(departments)
      .where(eq(departments.deptNo, deptNo))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  public async create(department: typeof departments.$inferInsert): Promise<void> {
    await this.db.insert(departments).values(department);
  }

  public async update(
    deptNo: string,
    department: Partial<typeof departments.$inferInsert>,
  ): Promise<number> {
    const result = await this.db
      .update(departments)
      .set(department)
      .where(eq(departments.deptNo, deptNo));

    return result[0].affectedRows;
  }

  public async remove(deptNo: string): Promise<number> {
    const result = await this.db.delete(departments).where(eq(departments.deptNo, deptNo));

    return result[0].affectedRows;
  }
}
