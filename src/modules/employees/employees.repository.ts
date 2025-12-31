import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@/database';
import { employees } from '@modules/employees/employees.schema';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class EmployeesRepository extends BaseRepository<typeof employees> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, employees);
  }
}
