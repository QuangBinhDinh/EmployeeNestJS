import { employees } from './employees.schema';

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
}

// TypeScript interfaces
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
