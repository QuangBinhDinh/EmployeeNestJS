import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DATABASE_CONNECTION } from '@/database';
import { BaseRepository } from '@common/repositories/base.repository';
import { deviceDetailLog } from './device-detail-log.schema';

@Injectable()
export class DeviceDetailLogRepository extends BaseRepository<typeof deviceDetailLog> {
  public constructor(
    @Inject(DATABASE_CONNECTION)
    db: MySql2Database,
  ) {
    super(db, deviceDetailLog);
  }
}
