import { Module, Global, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import { Logger as DrizzleLogger } from 'drizzle-orm/logger';
import * as mysql from 'mysql2/promise';
import { databaseConfig } from '@/database';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

class QueryLogger implements DrizzleLogger {
  private readonly logger = new Logger('DrizzleORM');

  logQuery(query: string, params: unknown[]): void {
    this.logger.log(`SQL: ${query}`);
    if (params.length > 0) {
      this.logger.log(`Params: ${JSON.stringify(params)}`);
    }
  }
}

const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: async () => {
    const connection = await mysql.createConnection(databaseConfig);
    return drizzle(connection, {
      mode: 'default',
      logger: new QueryLogger(),
    });
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
