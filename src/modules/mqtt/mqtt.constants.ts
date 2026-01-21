/**
 * MQTT Topic Constants
 *
 * This file defines all MQTT topics used in the application.
 * Following a hierarchical naming convention for IoT scenarios.
 */

export const MQTT_TOPICS = {
  // IoT Sensor Topics
  SENSORS: {
    TEMPERATURE: 'sensors/temperature',
    HUMIDITY: 'sensors/humidity',
    PRESSURE: 'sensors/pressure',
    ALL: 'sensors/+', // Wildcard for all sensor types
  },

  // Device Topics
  DEVICES: {
    STATUS: 'devices/status',
    COMMAND: 'devices/command',
    HEARTBEAT: 'devices/heartbeat',
  },

  // Alert Topics
  ALERTS: {
    CRITICAL: 'alerts/critical',
    WARNING: 'alerts/warning',
    INFO: 'alerts/info',
  },

  // System Topics
  SYSTEM: {
    LOGS: 'system/logs',
    HEALTH: 'system/health',
  },
} as const;

export type MqttTopic = (typeof MQTT_TOPICS)[keyof typeof MQTT_TOPICS];
