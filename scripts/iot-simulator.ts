/**
 * IoT Sensor Simulator
 *
 * This script simulates IoT sensors sending data via MQTT.
 * Use it to test the MQTT integration without real hardware.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/iot-simulator.ts
 *
 * Requirements:
 *   - MQTT broker running on localhost:1883
 *   - npm install mqtt (already installed)
 */

import * as mqtt from 'mqtt';

// Configuration
const MQTT_BROKER = process.env.MQTT_HOST || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || '1883';
const MQTT_URL = `mqtt://${MQTT_BROKER}:${MQTT_PORT}`;

// Sensor configuration
const SENSORS = [
  {
    id: 'temp-warehouse-a',
    type: 'temperature',
    location: 'warehouse-a',
    min: 15,
    max: 35,
    unit: '°C',
  },
  {
    id: 'temp-warehouse-b',
    type: 'temperature',
    location: 'warehouse-b',
    min: 18,
    max: 28,
    unit: '°C',
  },
  {
    id: 'humidity-warehouse-a',
    type: 'humidity',
    location: 'warehouse-a',
    min: 30,
    max: 70,
    unit: '%',
  },
  {
    id: 'humidity-warehouse-b',
    type: 'humidity',
    location: 'warehouse-b',
    min: 40,
    max: 80,
    unit: '%',
  },
  {
    id: 'pressure-main',
    type: 'pressure',
    location: 'main-building',
    min: 1000,
    max: 1030,
    unit: 'hPa',
  },
];

const DEVICES = [
  { id: 'device-001', name: 'Temperature Controller A' },
  { id: 'device-002', name: 'Humidity Controller B' },
  { id: 'device-003', name: 'HVAC System' },
];

// MQTT Topics
const TOPICS = {
  temperature: 'sensors/temperature',
  humidity: 'sensors/humidity',
  pressure: 'sensors/pressure',
  deviceStatus: 'devices/status',
  deviceHeartbeat: 'devices/heartbeat',
  alertCritical: 'alerts/critical',
  alertWarning: 'alerts/warning',
};

// Helper functions
function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Connect to MQTT broker
console.log(`🔌 Connecting to MQTT broker at ${MQTT_URL}...`);
const client = mqtt.connect(MQTT_URL, {
  clientId: `iot-simulator-${Date.now()}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  console.log('📡 Starting IoT sensor listener...\n');

  // Subscribe to ALL sensor and device topics to receive messages
  const topicsToSubscribe = [
    'sensors/#', // All sensor topics (temperature, humidity, pressure)
    'devices/#', // All device topics (status, command, heartbeat)
    'alerts/#', // All alert topics (critical, warning, info)
  ];

  client.subscribe(topicsToSubscribe, (err) => {
    if (err) {
      console.error('Failed to subscribe:', err);
    } else {
      console.log('📥 Subscribed to topics:');
      topicsToSubscribe.forEach((t) => console.log(`   - ${t}`));
      console.log('\n🎧 Waiting for messages... (Call the API to publish data)\n');
    }
  });

  // Start simulations (commented out - enable if you want auto-publishing)
  //simulateSensorReadings();
  //   simulateDeviceHeartbeats();
  //   simulateDeviceStatusUpdates();
  //   simulateRandomAlerts();
});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('message', (topic, message) => {
  const timestamp = new Date().toLocaleTimeString();

  try {
    let parsed = JSON.parse(message.toString());

    // NestJS ClientProxy.emit() wraps payload in { pattern, data } structure
    // Extract the actual data if it's wrapped
    const data = parsed.data !== undefined ? parsed.data : parsed;

    // Format output based on topic type
    if (topic.startsWith('sensors/')) {
      console.log(`📊 [${timestamp}] SENSOR DATA on "${topic}":`);
      console.log(`   Sensor ID: ${data.sensorId}`);
      console.log(`   Value: ${data.value}${data.unit || ''}`);
      if (data.location) console.log(`   Location: ${data.location}`);
      console.log('');
    } else if (topic.startsWith('devices/')) {
      console.log(`🔧 [${timestamp}] DEVICE on "${topic}":`);
      console.log(`   ${JSON.stringify(data, null, 2)}`);
      console.log('');
    } else if (topic.startsWith('alerts/')) {
      console.log(`⚠️  [${timestamp}] ALERT on "${topic}":`);
      console.log(`   Severity: ${data.severity}`);
      console.log(`   Message: ${data.message}`);
      console.log('');
    } else {
      console.log(`📩 [${timestamp}] MESSAGE on "${topic}":`, message.toString());
    }
  } catch {
    console.log(`📩 [${timestamp}] RAW MESSAGE on "${topic}":`, message.toString());
  }
});

// Sensor readings simulation
function simulateSensorReadings() {
  setInterval(() => {
    const sensor = randomFromArray(SENSORS);
    const value = randomInRange(sensor.min, sensor.max);

    const reading = {
      sensorId: sensor.id,
      type: sensor.type,
      value,
      unit: sensor.unit,
      location: sensor.location,
      timestamp: new Date().toISOString(),
    };

    const topic = TOPICS[sensor.type as keyof typeof TOPICS] || TOPICS.temperature;
    client.publish(topic, JSON.stringify(reading));

    const valueStr = `${value}${sensor.unit}`;
    console.log(`📊 [${sensor.type.toUpperCase()}] ${sensor.id}: ${valueStr} (${sensor.location})`);

    // Check for threshold violations and generate alerts
    if (sensor.type === 'temperature' && (value > 32 || value < 10)) {
      generateAlert(
        value > 32 ? 'warning' : 'info',
        `Temperature ${value > 32 ? 'high' : 'low'}: ${valueStr}`,
        sensor.id,
      );
    }
  }, 3000); // Every 3 seconds
}

// Device heartbeats simulation
function simulateDeviceHeartbeats() {
  setInterval(() => {
    DEVICES.forEach((device) => {
      const heartbeat = {
        deviceId: device.id,
        timestamp: new Date().toISOString(),
      };
      client.publish(TOPICS.deviceHeartbeat, JSON.stringify(heartbeat));
    });
    console.log(`💓 Heartbeats sent for ${DEVICES.length} devices`);
  }, 10000); // Every 10 seconds
}

// Device status updates simulation
function simulateDeviceStatusUpdates() {
  setInterval(() => {
    const device = randomFromArray(DEVICES);
    const statuses: Array<'online' | 'offline' | 'maintenance'> = [
      'online',
      'online',
      'online',
      'maintenance',
    ];
    const status = randomFromArray(statuses);

    const statusUpdate = {
      deviceId: device.id,
      status,
      batteryLevel: Math.floor(Math.random() * 100),
      firmwareVersion: '1.2.3',
      lastSeen: new Date().toISOString(),
    };

    client.publish(TOPICS.deviceStatus, JSON.stringify(statusUpdate));
    console.log(`🔧 [DEVICE] ${device.id}: ${status} (battery: ${statusUpdate.batteryLevel}%)`);
  }, 15000); // Every 15 seconds
}

// Random alerts simulation
function simulateRandomAlerts() {
  setInterval(() => {
    // Only generate alerts occasionally (20% chance)
    if (Math.random() > 0.2) return;

    const alertTypes = [
      {
        severity: 'warning',
        message: 'Sensor calibration required',
        source: randomFromArray(SENSORS).id,
      },
      {
        severity: 'warning',
        message: 'Connection intermittent',
        source: randomFromArray(DEVICES).id,
      },
      { severity: 'critical', message: 'Sensor offline', source: randomFromArray(SENSORS).id },
      { severity: 'info', message: 'Scheduled maintenance reminder', source: 'system' },
    ];

    const alertType = randomFromArray(alertTypes);
    generateAlert(
      alertType.severity as 'warning' | 'critical' | 'info',
      alertType.message,
      alertType.source,
    );
  }, 20000); // Check every 20 seconds
}

function generateAlert(severity: 'warning' | 'critical' | 'info', message: string, source: string) {
  const alert = {
    alertId: `alert-${Date.now()}`,
    severity,
    message,
    source,
    timestamp: new Date().toISOString(),
  };

  const topic = severity === 'critical' ? TOPICS.alertCritical : TOPICS.alertWarning;
  client.publish(topic, JSON.stringify(alert));
  console.log(`⚠️  [${severity.toUpperCase()}] ${message} (source: ${source})`);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down simulator...');
  client.end();
  process.exit(0);
});

console.log('Press Ctrl+C to stop the simulator\n');
