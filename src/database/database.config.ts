import * as dotenv from 'dotenv';

// Load environment variables before using them
dotenv.config();

// console.log('Database Config:', {
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '3306'),
//   user: process.env.DB_USER || 'nhsvlocal',
//   database: process.env.DB_NAME || 'employees',
// });

export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
