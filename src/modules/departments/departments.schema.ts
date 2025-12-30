import { mysqlTable, char, varchar, int } from 'drizzle-orm/mysql-core';

export const departments = mysqlTable('departments', {
  id: int('id').primaryKey().notNull().autoincrement(),
  deptNo: char('dept_no', { length: 4 }).notNull().unique(),
  deptName: varchar('dept_name', { length: 40 }).notNull().unique(),
});

// TypeScript interfaces
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
