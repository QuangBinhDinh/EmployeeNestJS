import { mysqlTable, char, varchar } from 'drizzle-orm/mysql-core';

export const departments = mysqlTable('departments', {
  deptNo: char('dept_no', { length: 4 }).primaryKey().notNull(),
  deptName: varchar('dept_name', { length: 40 }).notNull().unique(),
});

// TypeScript interfaces
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
