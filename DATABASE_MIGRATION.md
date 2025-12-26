# Database Migration Guide

This project uses **Drizzle ORM** with schema-based migrations. The TypeScript schema files (`*.schema.ts`) are the **single source of truth** for your database structure.

## 📁 File Structure

```
src/
├── config/
│   ├── scripts/
│   │   ├── migrate.ts      # Run migrations
│   │   ├── seed.ts         # Seed sample data
│   │   ├── reset.ts        # Reset database
│   │   └── migrations/     # Generated migration SQL files
│   ├── database.config.ts
│   └── database.module.ts
├── modules/
│   ├── employees/
│   │   └── employees.schema.ts  # Employee table schema
│   └── departments/
│       └── departments.schema.ts # Department table schema
└── drizzle.config.ts       # Drizzle Kit configuration
```

## 🚀 Available Commands

### 1. Generate Migration Files
```bash
npm run db:generate
```
- Reads all `*.schema.ts` files
- Generates SQL migration files in `src/config/scripts/migrations/`
- Run this whenever you modify schema files

### 2. Run Migrations
```bash
npm run db:migrate
```
- Applies pending migrations to your database
- Creates/updates tables based on schema definitions
- Safe to run multiple times (only applies new migrations)

### 3. Seed Database
```bash
npm run db:seed
```
- Populates database with sample data
- Uses departments and employees seed data
- **Note:** Customize seed data in `src/config/scripts/seed.ts`

### 4. Reset Database
```bash
npm run db:reset
```
- ⚠️ **WARNING:** Drops ALL tables
- Completely cleans the database
- Use when you want to start fresh

### 5. Push Schema Directly (Development Only)
```bash
npm run db:push
```
- Directly syncs schema to database without creating migration files
- Useful for rapid prototyping
- **Not recommended for production**

### 6. Open Drizzle Studio
```bash
npm run db:studio
```
- Opens a visual database browser at `https://local.drizzle.studio`
- View and edit data through UI

## 🔄 Typical Workflow

### Initial Setup
```bash
# 1. Generate initial migration
npm run db:generate

# 2. Apply migration (create tables)
npm run db:migrate

# 3. Seed sample data
npm run db:seed
```

### Making Schema Changes
```bash
# 1. Edit your *.schema.ts file
# Example: Add a new column to employees.schema.ts

# 2. Generate migration
npm run db:generate

# 3. Apply the migration
npm run db:migrate
```

### Reset and Rebuild
```bash
# 1. Drop all tables
npm run db:reset

# 2. Recreate tables
npm run db:migrate

# 3. Add sample data
npm run db:seed
```

## 📝 Schema Definition Example

```typescript
// employees.schema.ts
import { mysqlTable, int, varchar, date, mysqlEnum } from 'drizzle-orm/mysql-core';

export const employees = mysqlTable('employees', {
  empNo: int('emp_no').primaryKey().notNull(),
  birthDate: date('birth_date').notNull(),
  firstName: varchar('first_name', { length: 14 }).notNull(),
  lastName: varchar('last_name', { length: 16 }).notNull(),
  gender: mysqlEnum('gender', ['M', 'F']).notNull(),
  hireDate: date('hire_date').notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
```

## ⚙️ Configuration

Database connection is configured in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employees
```

## 🎯 Benefits of This Approach

1. **Type Safety**: TypeScript schemas provide full type checking
2. **Single Source of Truth**: Schema files define your database structure
3. **Version Control**: Migration files can be committed to git
4. **Team Collaboration**: Everyone uses the same schema definitions
5. **Rollback Support**: Migration files enable reverting changes
6. **No Raw SQL**: Define tables using TypeScript, not SQL

## 🔧 Troubleshooting

### "Cannot find module '@modules/...'"
- Make sure `tsconfig-paths` is installed: `npm install --save-dev tsconfig-paths`
- Verify path aliases in `tsconfig.json`

### Migration Conflicts
- If schemas are out of sync, run: `npm run db:reset && npm run db:migrate`

### Seed Data Already Exists
- Clear data first: `npm run db:reset` then `npm run db:migrate && npm run db:seed`

## 📚 Learn More

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [MySQL Column Types](https://orm.drizzle.team/docs/column-types/mysql)
