import { deviceLog } from './device-log.schema';
import { deviceDetailLog } from './device-detail-log.schema';

export type DeviceDetailLog = typeof deviceDetailLog.$inferSelect;
export type NewDeviceDetailLog = typeof deviceDetailLog.$inferInsert;

export type DeviceLog = typeof deviceLog.$inferSelect;
export type NewDeviceLog = typeof deviceLog.$inferInsert;

export type DeviceLogWithDetails = DeviceLog & {
  logs: DeviceDetailLog[];
};
export type NewDeviceLogWithDetails = NewDeviceLog & {
  logs: NewDeviceDetailLog[];
};
