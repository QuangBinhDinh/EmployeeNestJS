import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@/database';
import { users } from '@modules/users/users.schema';
import { BaseRepository } from '@common/repositories/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<typeof users> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, users);
  }

  protected getPrimaryKey() {
    return users.id;
  }
}
