import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { employees } from '../src/modules/employees/employees.schema';
import { departments } from '../src/modules/departments/departments.schema';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seeding...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'nhsvlocal',
    password: process.env.DB_PASSWORD || 'Nhsv2025',
    database: process.env.DB_NAME || 'employees',
  });

  const db = drizzle(connection);

  try {
    // Seed Departments
    console.log('📦 Seeding departments...');
    await db.insert(departments).values([
      { deptNo: 'd001', deptName: 'Marketing' },
      { deptNo: 'd002', deptName: 'Finance' },
      { deptNo: 'd003', deptName: 'Human Resources' },
      { deptNo: 'd004', deptName: 'Production' },
      { deptNo: 'd005', deptName: 'Development' },
      { deptNo: 'd006', deptName: 'Quality Management' },
      { deptNo: 'd007', deptName: 'Sales' },
      { deptNo: 'd008', deptName: 'Research' },
      { deptNo: 'd009', deptName: 'Customer Service' },
    ]);
    console.log('✅ Departments seeded successfully!');

    // Seed Employees
    console.log('📦 Seeding employees...');
    await db.insert(employees).values([
      {
        empNo: 10001,
        birthDate: new Date('1953-09-02'),
        firstName: 'Georgi',
        lastName: 'Facello',
        gender: 'M',
        hireDate: new Date('1986-06-26'),
      },
      {
        empNo: 10002,
        birthDate: new Date('1964-06-02'),
        firstName: 'Bezalel',
        lastName: 'Simmel',
        gender: 'F',
        hireDate: new Date('1985-11-21'),
      },
      {
        empNo: 10003,
        birthDate: new Date('1959-12-03'),
        firstName: 'Parto',
        lastName: 'Bamford',
        gender: 'M',
        hireDate: new Date('1986-08-28'),
      },
      {
        empNo: 10004,
        birthDate: new Date('1954-05-01'),
        firstName: 'Chirstian',
        lastName: 'Koblick',
        gender: 'M',
        hireDate: new Date('1986-12-01'),
      },
      {
        empNo: 10005,
        birthDate: new Date('1955-01-21'),
        firstName: 'Kyoichi',
        lastName: 'Maliniak',
        gender: 'M',
        hireDate: new Date('1989-09-12'),
      },
      {
        empNo: 10006,
        birthDate: new Date('1953-04-20'),
        firstName: 'Anneke',
        lastName: 'Preusig',
        gender: 'F',
        hireDate: new Date('1989-06-02'),
      },
      {
        empNo: 10007,
        birthDate: new Date('1957-05-23'),
        firstName: 'Tzvetan',
        lastName: 'Zielinski',
        gender: 'F',
        hireDate: new Date('1989-02-10'),
      },
      {
        empNo: 10008,
        birthDate: new Date('1958-02-19'),
        firstName: 'Saniya',
        lastName: 'Kalloufi',
        gender: 'M',
        hireDate: new Date('1994-09-15'),
      },
      {
        empNo: 10009,
        birthDate: new Date('1952-04-19'),
        firstName: 'Sumant',
        lastName: 'Peac',
        gender: 'F',
        hireDate: new Date('1985-02-18'),
      },
      {
        empNo: 10010,
        birthDate: new Date('1963-06-01'),
        firstName: 'Duangkaew',
        lastName: 'Piveteau',
        gender: 'F',
        hireDate: new Date('1989-08-24'),
      },
    ]);
    console.log('✅ Employees seeded successfully!');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
