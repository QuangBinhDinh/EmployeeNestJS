import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@db/database.module';
import { departments } from '@modules/departments/departments.schema';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class DepartmentsRepository extends BaseRepository<typeof departments> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, departments);
  }

  protected getPrimaryKey() {
    return departments.deptNo;
  }
}
