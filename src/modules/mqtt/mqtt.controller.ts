import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MqttPublisherService } from './mqtt-publisher.service';
import { MqttEventListener } from './mqtt-event.listener';
import { MQTT_TOPICS } from './mqtt.constants';
import { SensorDataDto, DeviceCommandDto, AlertDto, AlertSeverity } from './dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * MqttController
 *
 * REST API endpoints for interacting with MQTT functionality.
 * Provides endpoints to:
 * - Publish messages to MQTT topics
 * - View received sensor data
 * - Send device commands
 * - View alerts and device statuses
 */
@ApiTags('MQTT - IoT Sensors')
@Controller('mqtt')
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  constructor(
    private readonly mqttPublisher: MqttPublisherService,
    private readonly mqttEventListener: MqttEventListener,
  ) {}

  // ============================================
  // Sensor Data Endpoints
  // ============================================

  @Post('sensors/temperature')
  @ApiOperation({ summary: 'Publish temperature sensor data' })
  @ApiResponse({ status: 201, description: 'Temperature data published successfully' })
  @Public()
  async publishTemperature(@Body() data: SensorDataDto) {
    const payload = {
      ...data,
      type: 'temperature',
      timestamp: data.timestamp || new Date().toISOString(),
    };

    await this.mqttPublisher.publish(MQTT_TOPICS.SENSORS.TEMPERATURE, payload);

    return {
      success: true,
      message: 'Temperature data published',
      topic: MQTT_TOPICS.SENSORS.TEMPERATURE,
      data: payload,
    };
  }

  @Post('sensors/humidity')
  @ApiOperation({ summary: 'Publish humidity sensor data' })
  @ApiResponse({ status: 201, description: 'Humidity data published successfully' })
  @Public()
  async publishHumidity(@Body() data: SensorDataDto) {
    const payload = {
      ...data,
      type: 'humidity',
      timestamp: data.timestamp || new Date().toISOString(),
    };

    await this.mqttPublisher.publish(MQTT_TOPICS.SENSORS.HUMIDITY, payload);

    return {
      success: true,
      message: 'Humidity data published',
      topic: MQTT_TOPICS.SENSORS.HUMIDITY,
      data: payload,
    };
  }

  @Post('sensors/pressure')
  @ApiOperation({ summary: 'Publish pressure sensor data' })
  @ApiResponse({ status: 201, description: 'Pressure data published successfully' })
  @Public()
  async publishPressure(@Body() data: SensorDataDto) {
    const payload = {
      ...data,
      type: 'pressure',
      timestamp: data.timestamp || new Date().toISOString(),
    };

    await this.mqttPublisher.publish(MQTT_TOPICS.SENSORS.PRESSURE, payload);

    return {
      success: true,
      message: 'Pressure data published',
      topic: MQTT_TOPICS.SENSORS.PRESSURE,
      data: payload,
    };
  }

  @Get('sensors')
  @ApiOperation({ summary: 'Get all sensor IDs that have reported data' })
  @ApiResponse({ status: 200, description: 'List of sensor IDs' })
  @Public()
  getSensorIds() {
    return {
      sensors: this.mqttEventListener.getAllSensorIds(),
    };
  }

  @Get('sensors/:sensorId/readings')
  @ApiOperation({ summary: 'Get readings for a specific sensor' })
  @ApiParam({ name: 'sensorId', description: 'The sensor identifier' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of readings to return' })
  @Public()
  @ApiResponse({ status: 200, description: 'Sensor readings' })
  getSensorReadings(@Param('sensorId') sensorId: string, @Query('limit') limit?: string) {
    const readings = this.mqttEventListener.getSensorReadings(
      sensorId,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      sensorId,
      count: readings.length,
      readings,
    };
  }

  // ============================================
  // Device Command Endpoints
  // ============================================

  @Post('devices/command')
  @ApiOperation({ summary: 'Send a command to a device' })
  @ApiResponse({ status: 201, description: 'Command sent successfully' })
  @Public()
  async sendDeviceCommand(@Body() command: DeviceCommandDto) {
    const payload = {
      ...command,
      timestamp: new Date().toISOString(),
    };

    await this.mqttPublisher.publish(MQTT_TOPICS.DEVICES.COMMAND, payload);

    return {
      success: true,
      message: `Command '${command.command}' sent to device ${command.deviceId}`,
      topic: MQTT_TOPICS.DEVICES.COMMAND,
      data: payload,
    };
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all device statuses' })
  @ApiResponse({ status: 200, description: 'List of device statuses' })
  @Public()
  getAllDeviceStatuses() {
    return {
      devices: this.mqttEventListener.getAllDeviceStatuses(),
    };
  }

  @Get('devices/:deviceId/status')
  @ApiOperation({ summary: 'Get status for a specific device' })
  @ApiParam({ name: 'deviceId', description: 'The device identifier' })
  @ApiResponse({ status: 200, description: 'Device status' })
  @Public()
  getDeviceStatus(@Param('deviceId') deviceId: string) {
    const status = this.mqttEventListener.getDeviceStatus(deviceId);

    return {
      deviceId,
      status: status || null,
      found: !!status,
    };
  }

  // ============================================
  // Alert Endpoints
  // ============================================

  @Post('alerts')
  @ApiOperation({ summary: 'Publish an alert' })
  @ApiResponse({ status: 201, description: 'Alert published successfully' })
  @Public()
  async publishAlert(@Body() alert: AlertDto) {
    const payload = {
      ...alert,
      timestamp: alert.timestamp || new Date().toISOString(),
    };

    // Route to appropriate topic based on severity
    let topic: string;
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        topic = MQTT_TOPICS.ALERTS.CRITICAL;
        break;
      case AlertSeverity.WARNING:
        topic = MQTT_TOPICS.ALERTS.WARNING;
        break;
      default:
        topic = MQTT_TOPICS.ALERTS.INFO;
    }

    await this.mqttPublisher.publish(topic, payload);

    return {
      success: true,
      message: 'Alert published',
      topic,
      data: payload,
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of alerts to return' })
  @ApiQuery({ name: 'severity', required: false, enum: AlertSeverity })
  @ApiResponse({ status: 200, description: 'List of alerts' })
  @Public()
  getAlerts(@Query('limit') limit?: string, @Query('severity') severity?: AlertSeverity) {
    const alerts = this.mqttEventListener.getAlerts(limit ? parseInt(limit, 10) : 50, severity);

    return {
      count: alerts.length,
      alerts,
    };
  }

  // ============================================
  // Status Endpoints
  // ============================================

  @Get('status')
  @ApiOperation({ summary: 'Get MQTT connection status' })
  @ApiResponse({ status: 200, description: 'MQTT connection status' })
  @Public()
  getStatus() {
    return {
      connected: this.mqttPublisher.getConnectionStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}
