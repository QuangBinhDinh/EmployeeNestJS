import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database';
import { users, User } from '@modules/users/users.schema';
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

  public async findByUsername(username: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }
}
