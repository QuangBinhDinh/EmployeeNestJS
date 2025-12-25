import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../db/database.module';
import * as schema from '../db/schema';
import { Department } from '../db/schema';

@Injectable()
export class DepartmentsRepository {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    private db: MySql2Database<typeof schema>,
  ) {}

  public async findAll(limit: number, offset: number): Promise<Department[]> {
    return await this.db.select().from(schema.departments).limit(limit).offset(offset);
  }

  public async findOne(deptNo: string): Promise<Department | null> {
    const result = await this.db
      .select()
      .from(schema.departments)
      .where(eq(schema.departments.deptNo, deptNo))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  public async create(department: typeof schema.departments.$inferInsert): Promise<void> {
    await this.db.insert(schema.departments).values(department);
  }

  public async update(
    deptNo: string,
    department: Partial<typeof schema.departments.$inferInsert>,
  ): Promise<number> {
    const result = await this.db
      .update(schema.departments)
      .set(department)
      .where(eq(schema.departments.deptNo, deptNo));

    return result[0].affectedRows;
  }

  public async remove(deptNo: string): Promise<number> {
    const result = await this.db
      .delete(schema.departments)
      .where(eq(schema.departments.deptNo, deptNo));

    return result[0].affectedRows;
  }
}
