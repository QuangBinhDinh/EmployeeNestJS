import { Module } from '@nestjs/common';
import { DeviceLogsController } from './device-log.controller';
import { DeviceLogService } from './device-log.service';
import { DeviceLogRepository } from './device-log.repository';
import { DeviceDetailLogRepository } from './device-detail-log.repository';

@Module({
  controllers: [DeviceLogsController],
  providers: [DeviceLogService, DeviceLogRepository, DeviceDetailLogRepository],
  exports: [DeviceDetailLogRepository, DeviceLogRepository],
})
export class DeviceLogModule {}
