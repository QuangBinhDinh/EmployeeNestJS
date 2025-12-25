import { mysqlTable, int, varchar, date, mysqlEnum } from 'drizzle-orm/mysql-core';

export const employees = mysqlTable('employees', {
  empNo: int('emp_no').primaryKey().notNull(),
  birthDate: date('birth_date').notNull(),
  firstName: varchar('first_name', { length: 14 }).notNull(),
  lastName: varchar('last_name', { length: 16 }).notNull(),
  gender: mysqlEnum('gender', ['M', 'F']).notNull(),
  hireDate: date('hire_date').notNull(),
});

// TypeScript interfaces
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
