import { mysqlTable, char, varchar, int } from 'drizzle-orm/mysql-core';
import { timestampColumns } from '@/database/helper';

export const departments = mysqlTable('departments', {
  id: int('id').primaryKey().notNull().autoincrement(),
  deptNo: char('dept_no', { length: 4 }).notNull().unique(),
  deptName: varchar('dept_name', { length: 40 }).notNull(),
  ...timestampColumns,
});

// TypeScript interfaces
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
