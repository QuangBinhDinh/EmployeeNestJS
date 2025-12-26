import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, count } from 'drizzle-orm';
import { MySqlTableWithColumns } from 'drizzle-orm/mysql-core';

export abstract class BaseRepository<T extends MySqlTableWithColumns<any>> {
  protected constructor(
    protected readonly db: MySql2Database,
    protected readonly table: T,
  ) {}

  public async findAll(limit: number, offset: number): Promise<any[]> {
    return await this.db.select().from(this.table).limit(limit).offset(offset);
  }

  public async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(this.table);
    return result[0].count;
  }

  public async findOne(id: any): Promise<any | null> {
    const primaryKey = this.getPrimaryKey();
    const result = await this.db.select().from(this.table).where(eq(primaryKey, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  public async create(data: any): Promise<void> {
    await this.db.insert(this.table).values(data);
  }

  public async update(id: any, data: Partial<any>): Promise<number> {
    const primaryKey = this.getPrimaryKey();
    const result = await this.db.update(this.table).set(data).where(eq(primaryKey, id));

    return result[0].affectedRows;
  }

  public async remove(id: any): Promise<number> {
    const primaryKey = this.getPrimaryKey();
    const result = await this.db.delete(this.table).where(eq(primaryKey, id));

    return result[0].affectedRows;
  }

  protected abstract getPrimaryKey(): any;
}
