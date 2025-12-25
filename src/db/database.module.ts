import { Module, Global } from "@nestjs/common";
import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import * as schema from "./schema";
import { databaseConfig } from "../config/database.config";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: async () => {
    const connection = await mysql.createConnection({
      ...databaseConfig,
      host: "localhost", // Use localhost to match MySQL user grants
    });
    return drizzle(connection, { schema, mode: "default" });
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
