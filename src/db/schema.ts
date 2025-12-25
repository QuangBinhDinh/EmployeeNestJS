import {
  mysqlTable,
  int,
  varchar,
  date,
  mysqlEnum,
  char,
} from "drizzle-orm/mysql-core";

export const employees = mysqlTable("employees", {
  empNo: int("emp_no").primaryKey().notNull(),
  birthDate: date("birth_date").notNull(),
  firstName: varchar("first_name", { length: 14 }).notNull(),
  lastName: varchar("last_name", { length: 16 }).notNull(),
  gender: mysqlEnum("gender", ["M", "F"]).notNull(),
  hireDate: date("hire_date").notNull(),
});

export const departments = mysqlTable("departments", {
  deptNo: char("dept_no", { length: 4 }).primaryKey().notNull(),
  deptName: varchar("dept_name", { length: 40 }).notNull().unique(),
});

export const salaries = mysqlTable("salaries", {
  empNo: int("emp_no").notNull(),
  salary: int("salary").notNull(),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
});

// TypeScript interfaces
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;
