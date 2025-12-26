import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  console.log('⚠️  WARNING: This will completely wipe your database!');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
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
