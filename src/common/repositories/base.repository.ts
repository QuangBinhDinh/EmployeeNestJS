import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, count, and } from 'drizzle-orm';
import { MySqlTableWithColumns, MySqlColumn } from 'drizzle-orm/mysql-core';
import { DEFAULT_QUERY_LIMIT } from '../constants/pagination.constants';

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

  /**
   * Get Drizzle columns map for the current table.
   */
  protected getColumns(): Record<string, MySqlColumn> {
    const table = this.table as any;
    return (table[Symbol.for('drizzle:Columns')] as Record<string, MySqlColumn>) || table;
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

  public async findAll(pagination?: {
    limit: number;
    offset: number;
  }): Promise<InferSelectModel<T>[]> {
    const limit = pagination?.limit ?? DEFAULT_QUERY_LIMIT;
    const offset = pagination?.offset ?? 0;
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

    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.primaryKeyColumn, id))
      .limit(1);
    return result.length > 0 ? (result[0] as InferSelectModel<T>) : null;
  }

  public async create(data: InferInsertModel<T>): Promise<InferSelectModel<T>> {
    const newData = this.tranformDataInput(data);
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

  /**
   * Find rows by a set of conditions
   */
  public async findByCondition(
    condition: Partial<InferSelectModel<T>>,
    pagination?: { limit: number; offset: number },
  ): Promise<InferSelectModel<T>[]> {
    const entries = Object.entries(condition) as Array<[keyof InferSelectModel<T>, unknown]>;
    const limit = pagination?.limit ?? DEFAULT_QUERY_LIMIT;
    const offset = pagination?.offset ?? 0;

    // Require at least one condition
    if (entries.length === 0) {
      throw new Error('findByCondition requires at least one field');
    }

    const columns = this.getColumns();
    const predicates: ReturnType<typeof eq>[] = [];

    for (const [key, value] of entries) {
      const column = columns[key as string];
      if (!column) {
        throw new Error(`Column "${String(key)}" does not exist on table`);
      }
      predicates.push(eq(column, value));
    }

    const whereClause = predicates.reduce((acc, curr) => (acc ? and(acc, curr) : curr));

    const result = await this.db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(limit)
      .offset(offset);
    return result as InferSelectModel<T>[];
  }

  /**
   * Update exactly one record by condition and return the updated row.
   */
  public async updateOneByCondition(
    condition: Partial<InferSelectModel<T>>,
    data: Partial<InferInsertModel<T>>,
  ): Promise<InferSelectModel<T> | null> {
    const entries = Object.entries(condition) as Array<[keyof InferSelectModel<T>, unknown]>;
    if (entries.length === 0) {
      throw new Error('updateOneByCondition requires at least one field in condition');
    }
    if (Object.keys(data).length === 0) {
      throw new Error('updateOneByCondition requires at least one field to update');
    }

    const columns = this.getColumns();
    const predicates: ReturnType<typeof eq>[] = [];

    for (const [key, value] of entries) {
      const column = columns[key as string];
      if (!column) {
        throw new Error(`Column "${String(key)}" does not exist on table`);
      }
      predicates.push(eq(column, value));
    }

    const whereClause = predicates.reduce((acc, curr) => (acc ? and(acc, curr) : curr));

    const transformedData = this.tranformDataInput(data) as Partial<InferInsertModel<T>>;

    await this.db.update(this.table).set(transformedData).where(whereClause).limit(1);

    const updated = await this.db.select().from(this.table).where(whereClause).limit(1);
    return updated.length > 0 ? (updated[0] as InferSelectModel<T>) : null;
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
