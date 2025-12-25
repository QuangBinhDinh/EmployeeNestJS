# NestJS CRUD Application with DrizzleORM

A NestJS application with CRUD operations for managing employees and departments using DrizzleORM and MySQL.

## Features

- **Employees CRUD**: Create, Read, Update, Delete operations for employees
- **Departments CRUD**: Create, Read, Update, Delete operations for departments
- **DrizzleORM**: Type-safe database queries with TypeScript
- **MySQL Database**: Connected to the existing employees database
- **Request Validation**: Automatic validation with class-validator
- **Swagger Documentation**: Interactive API documentation at `/api`
- **Repository Pattern**: Separation of data access and business logic
- **Professional Structure**: Request/Response DTOs, Service/Repository layers
- **Hot Reload**: Automatic server restart on file changes
- **Code Quality**: ESLint and Prettier configured

## Prerequisites

- Node.js (v16 or higher)
- MySQL server running on localhost:3306
- Database: `employees`

## Installation

```bash
npm install
```

## Configuration

The application uses environment variables. Create a `.env` file in the root directory (or set environment variables):

```bash
# Copy the example file
cp .env.example .env
```

Default configuration (in `src/config/database.config.ts`):
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Nhsv2025
DB_NAME=employees
PORT=3000
```

**Note**: The database configuration is stored in `src/config/database.config.ts`. You can modify these values directly or set environment variables to override them.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

**Swagger Documentation**: http://localhost:3000/api

## API Endpoints

### Employees

- `GET /employees` - Get all employees (supports `?limit=10&offset=0`)
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create new employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

#### Example Employee JSON:
```json
{
  "empNo": 999999,
  "birthDate": "1990-01-01",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "M",
  "hireDate": "2024-01-01"
}
```

### Departments

- `GET /departments` - Get all departments (supports `?limit=10&offset=0`)
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create new department
- `PUT /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

#### Example Department JSON:
```json
{
  "deptNo": "d010",
  "deptName": "Engineering"
}
```

## Database Schema

The application uses the following tables from the employees database:

### Employees Table
- `emp_no` (int, primary key)
- `birth_date` (date)
- `first_name` (varchar)
- `last_name` (varchar)
- `gender` (enum: 'M', 'F')
- `hire_date` (date)

### Departments Table
- `dept_no` (char(4), primary key)
- `dept_name` (varchar, unique)

## Project Structure

```
src/
├── db/
│   ├── schema.ts           # DrizzleORM schema definitions
│   └── database.module.ts  # Database connection module
├── employees/
│   ├── dto/
│   │   ├── create-employee.dto.ts
│   │   └── update-employee.dto.ts
│   ├── employees.controller.ts
│   ├── employees.service.ts
│   └── employees.module.ts
├── departments/
│   ├── dto/
│   │   ├── create-department.dto.ts
│   │   └── update-department.dto.ts
│   ├── departments.controller.ts
│   ├── departments.service.ts
│   └── departments.module.ts
├── app.module.ts
└── main.ts
```

## Technologies Used

- **NestJS**: Progressive Node.js framework
- **DrizzleORM**: TypeScript ORM
- **MySQL2**: MySQL client for Node.js
- **TypeScript**: Type-safe JavaScript
- **class-validator**: Request validation
- **class-transformer**: Data transformation
- **Swagger/OpenAPI**: API documentation
- **ESLint & Prettier**: Code quality tools

## Recent Improvements

✅ **Repository Pattern**: Separated data access from business logic  
✅ **Request/Response DTOs**: Organized into separate folders  
✅ **Validation**: Automatic request validation with class-validator  
✅ **Swagger Documentation**: Interactive API docs at `/api`  
✅ **Explicit Public Methods**: All methods clearly marked as public  
✅ **Code Quality**: ESLint and Prettier configured and enforced  

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed information about all improvements.

