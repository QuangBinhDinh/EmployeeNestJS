import { mysqlTable, bigint, varchar } from 'drizzle-orm/mysql-core';
import { timestampColumns } from '@/database/helper';

export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  fullName: varchar('full_name', { length: 100 }),
  ...timestampColumns,
});

// TypeScript interfaces
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
