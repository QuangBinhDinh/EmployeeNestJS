import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, count } from 'drizzle-orm';
import { MySqlTableWithColumns, MySqlColumn } from 'drizzle-orm/mysql-core';

type InferSelectModel<T> = T extends MySqlTableWithColumns<any> ? T['$inferSelect'] : never;
type InferInsertModel<T> = T extends MySqlTableWithColumns<any> ? T['$inferInsert'] : never;

export abstract class BaseRepository<T extends MySqlTableWithColumns<any>> {
  protected primaryKeyColumn: MySqlColumn | null = null;

  protected constructor(
    protected readonly db: MySql2Database,
    protected readonly table: T,
  ) {
    this.primaryKeyColumn = this.getPrimaryKey();
  }

  protected getPrimaryKey(): MySqlColumn | null {
    const table = this.table as any;
    const columns = table[Symbol.for('drizzle:Columns')] || table;
    // Iterate through all columns to find the primary key
    for (const columnName in columns) {
      const column = columns[columnName];
      if (column?.primary) {
        return column;
      }
    }

    // Fallback: try common primary key names
    if (table.id) return table.id;

    return null;
  }

  public async findAll(limit: number, offset: number): Promise<InferSelectModel<T>[]> {
    const result = await this.db.select().from(this.table).limit(limit).offset(offset);
    return result as InferSelectModel<T>[];
  }

  public async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(this.table);
    return result[0].count;
  }

  public async findOne(id: string | number): Promise<InferSelectModel<T> | null> {
    if (!this.primaryKeyColumn) {
      throw new Error('Primary key not found for table');
    }

    // console.log('Primary Key:', this.primaryKeyColumn);
    // console.log('ID:', id);
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.primaryKeyColumn, id))
      .limit(1);
    return result.length > 0 ? (result[0] as InferSelectModel<T>) : null;
  }

  public async create(data: InferInsertModel<T>): Promise<InferSelectModel<T>> {
    const newData = this.tranformDataInput(data);
    console.log('New Data:', newData);
    const result = await this.db.insert(this.table).values(newData);
    const insertedId = result[0].insertId;

    return await this.findOne(insertedId);
  }

  public async update(
    id: string | number,
    data: Partial<InferInsertModel<T>>,
  ): Promise<InferSelectModel<T> | null> {
    if (!this.primaryKeyColumn) {
      throw new Error('Primary key not found for table');
    }

    const newData = this.tranformDataInput(data);
    await this.db.update(this.table).set(newData).where(eq(this.primaryKeyColumn, id));
    return await this.findOne(id);
  }

  public async remove(id: string | number): Promise<number> {
    if (!this.primaryKeyColumn) {
      throw new Error('Primary key not found for table');
    }

    const result = await this.db.delete(this.table).where(eq(this.primaryKeyColumn, id));
    return result[0].affectedRows;
  }

  protected tranformDataInput<D extends Record<string, any>>(data: D): D {
    const transformed: any = { ...data };
    for (const key in transformed) {
      if (transformed[key] instanceof Date) {
        transformed[key] = transformed[key].toISOString().split('T')[0];
      }
    }
    return transformed as D;
  }
}
