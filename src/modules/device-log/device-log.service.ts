import { Injectable } from '@nestjs/common';
import { handleServiceError } from '@common/exceptions';
import { DeviceLogRepository } from './device-log.repository';
import { DeviceLogWithDetails } from './device-log.type';
import { CreateDeviceLogRequest } from './dto';

@Injectable()
export class DeviceLogService {
  public constructor(private readonly deviceLogRepository: DeviceLogRepository) {}

  public async findLogsByAccountNumber(accountNo: string): Promise<DeviceLogWithDetails> {
    try {
      const deviceInfo = await this.deviceLogRepository.findByCondition({ accountNo });
      if (!deviceInfo || deviceInfo.length === 0) {
        return null;
      }

      // Parse JSON logs back to array
      const { logs: logsJson, ...rest } = deviceInfo[0];
      const logs = JSON.parse(logsJson);

      return { ...rest, logs };
    } catch (error) {
      handleServiceError(error, 'DeviceLogService');
    }
  }

  public async pushLogMessages(request: CreateDeviceLogRequest): Promise<void> {
    try {
      const { logs, ...deviceInfo } = request;

      // Store logs as JSON string - single write operation for better performance
      const deviceLogData = {
        ...deviceInfo,
        logs: JSON.stringify(logs),
      };

      await this.deviceLogRepository.create(deviceLogData);
    } catch (error) {
      handleServiceError(error, 'DeviceLogService');
    }
  }
}
