import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@/database';
import { BaseRepository } from '@common/repositories/base.repository';
import { deviceLog } from './device-log.schema';

@Injectable()
export class DeviceLogRepository extends BaseRepository<typeof deviceLog> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, deviceLog);
  }
}
