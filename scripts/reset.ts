import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function resetDatabase() {
  console.log('⚠️  WARNING: This will completely wipe your database and migrations!');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'nhsvlocal',
    password: process.env.DB_PASSWORD || 'Nhsv2025',
    database: process.env.DB_NAME || 'employees',
    multipleStatements: true,
  });

  try {
    console.log('🗑️  Dropping all tables...');

    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Get all tables
    const [tables]: any = await connection.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME || 'employees'],
    );

    // Drop each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`  Dropping table: ${tableName}`);
      await connection.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✅ Database tables dropped successfully!');

    // Clear migrations folder
    console.log('🗑️  Clearing migrations folder...');
    const migrationsPath = path.join(__dirname, '../drizzle/migrations');
    if (fs.existsSync(migrationsPath)) {
      fs.rmSync(migrationsPath, { recursive: true, force: true });
      console.log('✅ Migrations folder cleared!');
    }

    console.log('✅ Database reset completed successfully!');
    console.log('💡 Run "npm run db:migrate" to recreate tables');
    console.log('💡 Run "npm run db:seed" to populate with sample data');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetDatabase();
