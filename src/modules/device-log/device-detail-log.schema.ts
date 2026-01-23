import { timestampColumns } from '@/database/helper';
import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';

export const deviceDetailLog = mysqlTable('device_detail_log', {
  id: int('id').primaryKey().notNull().autoincrement(),
  accountNo: varchar('account_no', { length: 32 }).notNull(),
  message: text('message').notNull(),
  ...timestampColumns,
});
