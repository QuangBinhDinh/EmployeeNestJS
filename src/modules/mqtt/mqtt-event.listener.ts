import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MQTT_EVENTS } from './mqtt-subscriber.service';
import { SensorDataDto, AlertDto, DeviceStatusDto } from './dto';

export interface SensorReading extends SensorDataDto {
  receivedAt: string;
}

export interface DeviceStatus extends DeviceStatusDto {
  receivedAt: string;
}

/**
 * MqttEventListener
 *
 * Listens to MQTT-related events and handles business logic.
 * This demonstrates how to decouple MQTT message handling from business logic.
 */
@Injectable()
export class MqttEventListener {
  private readonly logger = new Logger(MqttEventListener.name);

  // In-memory storage for demo purposes (use a database in production)
  private sensorReadings: Map<string, SensorReading[]> = new Map();
  private deviceStatuses: Map<string, DeviceStatus> = new Map();
  private alerts: AlertDto[] = [];

  /**
   * Handle sensor data received events
   */
  @OnEvent(MQTT_EVENTS.SENSOR_DATA_RECEIVED)
  handleSensorData(data: SensorReading) {
    this.logger.log(`Processing sensor data: ${data.sensorId} = ${data.value}${data.unit}`);

    // Store the reading
    const readings = this.sensorReadings.get(data.sensorId) || [];
    readings.push(data);

    // Keep only last 100 readings per sensor
    if (readings.length > 100) {
      readings.shift();
    }

    this.sensorReadings.set(data.sensorId, readings);

    // You could add more business logic here:
    // - Store in database
    // - Calculate averages
    // - Trigger automations
    // - Send notifications
  }

  /**
   * Handle device status updates
   */
  @OnEvent(MQTT_EVENTS.DEVICE_STATUS_RECEIVED)
  handleDeviceStatus(data: DeviceStatus) {
    this.logger.log(`Device ${data.deviceId} status: ${data.status}`);

    // Update device status
    this.deviceStatuses.set(data.deviceId, data);

    // Check for offline devices
    if (data.status === 'offline' || data.status === 'error') {
      this.logger.warn(`Device ${data.deviceId} is ${data.status}!`);
      // Could trigger notification or automated response
    }

    // Check for low battery
    if (data.batteryLevel && data.batteryLevel < 20) {
      this.logger.warn(`Device ${data.deviceId} has low battery: ${data.batteryLevel}%`);
    }
  }

  /**
   * Handle device heartbeat events
   */
  @OnEvent(MQTT_EVENTS.DEVICE_HEARTBEAT_RECEIVED)
  handleDeviceHeartbeat(data: { deviceId: string; timestamp: string; receivedAt: string }) {
    this.logger.debug(`Heartbeat from ${data.deviceId}`);

    // Update last seen time
    const currentStatus = this.deviceStatuses.get(data.deviceId);
    if (currentStatus) {
      currentStatus.lastSeen = data.receivedAt;
      this.deviceStatuses.set(data.deviceId, currentStatus);
    }
  }

  /**
   * Handle alert events
   */
  @OnEvent(MQTT_EVENTS.ALERT_RECEIVED)
  handleAlert(data: AlertDto) {
    this.logger.log(`Alert received: [${data.severity}] ${data.message}`);

    // Store the alert
    this.alerts.push(data);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    // Handle different severity levels
    switch (data.severity) {
      case 'critical':
        // Could send push notification, SMS, email, etc.
        this.logger.error(`CRITICAL: ${data.message} from ${data.source}`);
        break;
      case 'warning':
        // Could log to monitoring system
        this.logger.warn(`WARNING: ${data.message} from ${data.source}`);
        break;
      case 'info':
        // Just log
        this.logger.log(`INFO: ${data.message} from ${data.source}`);
        break;
    }
  }

  /**
   * Get latest readings for a sensor
   */
  getSensorReadings(sensorId: string, limit: number = 10): SensorReading[] {
    const readings = this.sensorReadings.get(sensorId) || [];
    return readings.slice(-limit);
  }

  /**
   * Get all sensor IDs
   */
  getAllSensorIds(): string[] {
    return Array.from(this.sensorReadings.keys());
  }

  /**
   * Get device status
   */
  getDeviceStatus(deviceId: string): DeviceStatus | undefined {
    return this.deviceStatuses.get(deviceId);
  }

  /**
   * Get all device statuses
   */
  getAllDeviceStatuses(): DeviceStatus[] {
    return Array.from(this.deviceStatuses.values());
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 50, severity?: string): AlertDto[] {
    let filteredAlerts = this.alerts;

    if (severity) {
      filteredAlerts = filteredAlerts.filter((a) => a.severity === severity);
    }

    return filteredAlerts.slice(-limit);
  }
}
