import { Inject, Injectable } from '@nestjs/common';
import { handleServiceError } from '@common/exceptions';
import { DeviceLogRepository } from './device-log.repository';
import { DeviceDetailLogRepository } from './device-detail-log.repository';
import { DeviceLogWithDetails } from './device-log.type';
import { DATABASE_CONNECTION } from '@/database';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { CreateDeviceLogRequest } from './dto';

@Injectable()
export class DeviceLogService {
  public constructor(
    private readonly deviceLogRepository: DeviceLogRepository,
    private readonly deviceDetailLogRepository: DeviceDetailLogRepository,
    @Inject(DATABASE_CONNECTION) private readonly db: MySql2Database,
  ) {}

  public async findLogsByAccountNumber(accountNo: string): Promise<DeviceLogWithDetails> {
    try {
      const deviceInfo = await this.deviceLogRepository.findByCondition({ accountNo });
      const logs = await this.deviceDetailLogRepository.findByCondition({ accountNo });
      return { ...deviceInfo[0], logs };
    } catch (error) {
      handleServiceError(error, 'DeviceLogService');
    }
  }

  public async pushLogMessages(request: CreateDeviceLogRequest): Promise<void> {
    try {
      return await this.db.transaction(async (tx) => {
        const { logs, ...deviceInfo } = request;
        const existed = await this.deviceLogRepository.txFindByCondition(tx, {
          accountNo: request.accountNo,
        });
        if (existed.length === 0) {
          await this.deviceLogRepository.txCreate(tx, deviceInfo);
        }
        // Bulk insert all logs in a single query for better performance
        const logsToInsert = logs.map((message) => ({
          message,
          accountNo: request.accountNo,
        }));
        await this.deviceDetailLogRepository.txBulkCreate(tx, logsToInsert);
      });
    } catch (error) {
      handleServiceError(error, 'DeviceLogService');
    }
  }
}
