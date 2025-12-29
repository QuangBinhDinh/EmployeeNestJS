import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { users } from '../src/modules/users/users.schema';

dotenv.config();

async function seedUsers() {
  console.log('🌱 Starting users seed...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'nhsvlocal',
    password: process.env.DB_PASSWORD || 'Nhsv2025',
    database: process.env.DB_NAME || 'employees',
  });

  const db = drizzle(connection);

  try {
    // Sample users data
    const sampleUsers = [
      {
        username: 'admin',
        password: 'Admin@123',
        email: 'admin@example.com',
        phone: '+1234567890',
        fullName: 'System Administrator',
      },
      {
        username: 'johndoe',
        password: 'John@123',
        email: 'john.doe@example.com',
        phone: '+1234567891',
        fullName: 'John Doe',
      },
      {
        username: 'janedoe',
        password: 'Jane@123',
        email: 'jane.doe@example.com',
        phone: '+1234567892',
        fullName: 'Jane Doe',
      },
      {
        username: 'bobsmith',
        password: 'Bob@123',
        email: 'bob.smith@example.com',
        phone: '+1234567893',
        fullName: 'Bob Smith',
      },
      {
        username: 'alicejones',
        password: 'Alice@123',
        email: 'alice.jones@example.com',
        phone: '+1234567894',
        fullName: 'Alice Jones',
      },
      {
        username: 'charliebrwn',
        password: 'Charlie@123',
        email: 'charlie.brown@example.com',
        phone: '+1234567895',
        fullName: 'Charlie Brown',
      },
      {
        username: 'dianaprince',
        password: 'Diana@123',
        email: 'diana.prince@example.com',
        phone: '+1234567896',
        fullName: 'Diana Prince',
      },
      {
        username: 'evanwilson',
        password: 'Evan@123',
        email: 'evan.wilson@example.com',
        phone: '+1234567897',
        fullName: 'Evan Wilson',
      },
      {
        username: 'fionagrey',
        password: 'Fiona@123',
        email: 'fiona.grey@example.com',
        phone: '+1234567898',
        fullName: 'Fiona Grey',
      },
      {
        username: 'georgewhite',
        password: 'George@123',
        email: 'george.white@example.com',
        phone: '+1234567899',
        fullName: 'George White',
      },
    ];

    console.log(`📝 Preparing to insert ${sampleUsers.length} users...`);

    // Hash passwords and insert users
    for (const userData of sampleUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);

      await db.insert(users).values({
        username: userData.username,
        passwordHash: passwordHash,
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
      });

      console.log(`✅ Created user: ${userData.username}`);
    }

    console.log('✅ Users seed completed successfully!');
    console.log('\n📋 User Credentials:');
    console.log('==========================================');
    sampleUsers.forEach((user) => {
      console.log(`Username: ${user.username.padEnd(15)} Password: ${user.password}`);
    });
    console.log('==========================================');
  } catch (error) {
    console.error('❌ Users seed failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedUsers();
