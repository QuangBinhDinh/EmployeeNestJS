import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SensorDataDto, DeviceStatusDto, AlertDto, AlertSeverity } from './dto';

/**
 * MQTT Events emitted by the subscriber service
 */
export const MQTT_EVENTS = {
  SENSOR_DATA_RECEIVED: 'mqtt.sensor.data.received',
  DEVICE_STATUS_RECEIVED: 'mqtt.device.status.received',
  ALERT_RECEIVED: 'mqtt.alert.received',
  DEVICE_HEARTBEAT_RECEIVED: 'mqtt.device.heartbeat.received',
} as const;

/**
 * MqttSubscriberService
 *
 * Service for processing MQTT data received via API.
 * Emits events for other parts of the application to consume.
 */
@Injectable()
export class MqttSubscriberService {
  private readonly logger = new Logger(MqttSubscriberService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Process temperature sensor data
   */
  processTemperatureData(data: SensorDataDto) {
    this.logger.log(`Processing temperature data: ${JSON.stringify(data)}`);

    const enrichedData = {
      ...data,
      type: 'temperature',
      receivedAt: new Date().toISOString(),
    };

    this.eventEmitter.emit(MQTT_EVENTS.SENSOR_DATA_RECEIVED, enrichedData);

    if (data.value > 30) {
      this.emitTemperatureAlert(data, 'high');
    } else if (data.value < 5) {
      this.emitTemperatureAlert(data, 'low');
    }

    return { status: 'processed' };
  }

  /**
   * Process humidity sensor data
   */
  processHumidityData(data: SensorDataDto) {
    this.logger.log(`Processing humidity data: ${JSON.stringify(data)}`);

    const enrichedData = {
      ...data,
      type: 'humidity',
      receivedAt: new Date().toISOString(),
    };

    this.eventEmitter.emit(MQTT_EVENTS.SENSOR_DATA_RECEIVED, enrichedData);

    return { status: 'processed' };
  }

  /**
   * Process pressure sensor data
   */
  processPressureData(data: SensorDataDto) {
    this.logger.log(`Processing pressure data: ${JSON.stringify(data)}`);

    const enrichedData = {
      ...data,
      type: 'pressure',
      receivedAt: new Date().toISOString(),
    };

    this.eventEmitter.emit(MQTT_EVENTS.SENSOR_DATA_RECEIVED, enrichedData);

    return { status: 'processed' };
  }

  /**
   * Process device status updates
   */
  processDeviceStatus(data: DeviceStatusDto) {
    this.logger.log(`Processing device status: ${JSON.stringify(data)}`);

    this.eventEmitter.emit(MQTT_EVENTS.DEVICE_STATUS_RECEIVED, {
      ...data,
      receivedAt: new Date().toISOString(),
    });

    return { status: 'processed', deviceId: data.deviceId };
  }

  /**
   * Process device heartbeat messages
   */
  processDeviceHeartbeat(data: { deviceId: string; timestamp: string }) {
    this.logger.debug(`Processing heartbeat from ${data.deviceId}`);

    this.eventEmitter.emit(MQTT_EVENTS.DEVICE_HEARTBEAT_RECEIVED, {
      ...data,
      receivedAt: new Date().toISOString(),
    });

    return { status: 'alive' };
  }

  /**
   * Process alerts
   */
  processAlert(data: AlertDto) {
    this.logger.log(`Processing alert [${data.severity}]: ${data.message}`);

    this.eventEmitter.emit(MQTT_EVENTS.ALERT_RECEIVED, {
      ...data,
      receivedAt: new Date().toISOString(),
    });

    return { status: 'acknowledged', alertId: data.alertId };
  }

  /**
   * Helper method to emit temperature alerts
   */
  private emitTemperatureAlert(data: SensorDataDto, type: 'high' | 'low') {
    const alert: AlertDto = {
      alertId: `temp-${Date.now()}`,
      severity: type === 'high' ? AlertSeverity.WARNING : AlertSeverity.INFO,
      message: `Temperature ${type === 'high' ? 'exceeded upper' : 'below lower'} threshold`,
      source: data.sensorId,
      sourceType: 'temperature_sensor',
      timestamp: new Date().toISOString(),
      metadata: {
        threshold: type === 'high' ? 30 : 5,
        actual: data.value,
        location: data.location,
      },
    };

    this.logger.warn(`Temperature alert: ${alert.message} (${data.value}${data.unit})`);
    this.eventEmitter.emit(MQTT_EVENTS.ALERT_RECEIVED, alert);
  }
}
