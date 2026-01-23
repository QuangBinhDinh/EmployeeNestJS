import { timestampColumns } from '@/database/helper';
import { mysqlTable, int, varchar, mediumtext } from 'drizzle-orm/mysql-core';

export const deviceLog = mysqlTable('device_log', {
  id: int('id').primaryKey().notNull().autoincrement(),
  deviceId: varchar('device_id', { length: 64 }).notNull(),
  accountNo: varchar('account_no', { length: 32 }).notNull(),
  platform: varchar('platform', { length: 10 }).notNull(),
  osVersion: varchar('os_version', { length: 10 }).notNull(),
  appVersion: varchar('app_version', { length: 10 }).notNull(),
  logs: mediumtext('logs').notNull(), // JSON stringified array (up to 16 MB)
  ...timestampColumns,
});
