# MQTT Integration Guide

## 📋 Overview

This project includes a fully functional MQTT module for IoT sensor monitoring and device management. The implementation follows NestJS best practices and integrates with the existing event-driven architecture.

## 🚀 Quick Start

### 1. Start the MQTT Broker

```bash
# Start all services including MQTT broker
npm run dock
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# MQTT Configuration
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=           # Optional - leave empty for anonymous
MQTT_PASSWORD=           # Optional - leave empty for anonymous
MQTT_CLIENT_ID=nestjs-app
```

### 3. Start the Application

```bash
npm run start
```

## 📡 API Endpoints

### Sensor Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mqtt/sensors/temperature` | Publish temperature data |
| POST | `/mqtt/sensors/humidity` | Publish humidity data |
| POST | `/mqtt/sensors/pressure` | Publish pressure data |
| GET | `/mqtt/sensors` | Get all sensor IDs |
| GET | `/mqtt/sensors/:sensorId/readings` | Get readings for a sensor |

### Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mqtt/devices/command` | Send command to a device |
| GET | `/mqtt/devices` | Get all device statuses |
| GET | `/mqtt/devices/:deviceId/status` | Get specific device status |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mqtt/alerts` | Publish an alert |
| GET | `/mqtt/alerts` | Get recent alerts |

### Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mqtt/status` | Check MQTT connection status |

## 🔧 MQTT Topics

```
sensors/
├── temperature      # Temperature sensor readings
├── humidity         # Humidity sensor readings
└── pressure         # Pressure sensor readings

devices/
├── status          # Device status updates
├── command         # Commands sent to devices
└── heartbeat       # Device heartbeat messages

alerts/
├── critical        # Critical alerts
├── warning         # Warning alerts
└── info            # Informational alerts

system/
├── logs            # System logs
└── health          # Health check messages
```

## 📝 Usage Examples

### Publishing Sensor Data

```bash
# Publish temperature reading
curl -X POST http://localhost:3000/mqtt/sensors/temperature \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "temp-001",
    "value": 23.5,
    "unit": "°C",
    "location": "warehouse-a"
  }'
```

### Sending Device Commands

```bash
# Restart a device
curl -X POST http://localhost:3000/mqtt/devices/command \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-001",
    "command": "restart",
    "issuedBy": "admin"
  }'
```

### Publishing Alerts

```bash
# Publish a warning alert
curl -X POST http://localhost:3000/mqtt/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alertId": "alert-001",
    "severity": "warning",
    "message": "Temperature threshold exceeded",
    "source": "temp-001"
  }'
```

### Getting Sensor Readings

```bash
# Get last 10 readings from a sensor
curl http://localhost:3000/mqtt/sensors/temp-001/readings?limit=10
```

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   REST Controller   │     │   MQTT Broker       │
│   (mqtt.controller) │     │   (Mosquitto)       │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  MqttPublisher      │────▶│  MQTT Topics        │
│  Service            │     │  sensors/*, etc.    │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  MqttSubscriber     │
                            │  Service            │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  EventEmitter       │
                            │  (NestJS Events)    │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  MqttEventListener  │
                            │  (Business Logic)   │
                            └─────────────────────┘
```

## 🔌 Integration with Other Modules

### Using MQTT Publisher in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { MqttPublisherService, MQTT_TOPICS } from '@modules/mqtt';

@Injectable()
export class YourService {
  constructor(private readonly mqttPublisher: MqttPublisherService) {}

  async notifyTemperatureChange(sensorId: string, value: number) {
    await this.mqttPublisher.publish(MQTT_TOPICS.SENSORS.TEMPERATURE, {
      sensorId,
      value,
      unit: '°C',
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Listening to MQTT Events

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MQTT_EVENTS } from '@modules/mqtt';

@Injectable()
export class YourEventListener {
  @OnEvent(MQTT_EVENTS.SENSOR_DATA_RECEIVED)
  handleSensorData(data: any) {
    console.log('Sensor data received:', data);
    // Your business logic here
  }

  @OnEvent(MQTT_EVENTS.ALERT_RECEIVED)
  handleAlert(alert: any) {
    console.log('Alert received:', alert);
    // Send notification, store in database, etc.
  }
}
```

## 🧪 Testing with MQTT Client

You can use any MQTT client to test. Here's an example using `mosquitto_pub`:

```bash
# Subscribe to all sensor topics
mosquitto_sub -h localhost -t 'sensors/#' -v

# Publish a temperature reading
mosquitto_pub -h localhost -t 'sensors/temperature' \
  -m '{"sensorId":"test-001","value":25.5,"unit":"°C"}'
```

Or use MQTT Explorer (GUI client):
- Download from: https://mqtt-explorer.com/
- Connect to: `localhost:1883`

## ⚙️ Configuration Options

### Mosquitto Broker Configuration

Edit `mosquitto/config/mosquitto.conf`:

```conf
# Enable authentication (recommended for production)
allow_anonymous false
password_file /mosquitto/config/passwd

# Enable TLS (recommended for production)
listener 8883
cafile /mosquitto/certs/ca.crt
certfile /mosquitto/certs/server.crt
keyfile /mosquitto/certs/server.key
```

### NestJS MQTT Options

Available in `mqtt.config.ts`:

| Option | Description | Default |
|--------|-------------|---------|
| `url` | MQTT broker URL | `mqtt://localhost:1883` |
| `clientId` | Unique client identifier | Auto-generated |
| `clean` | Start with clean session | `true` |
| `connectTimeout` | Connection timeout (ms) | `4000` |
| `reconnectPeriod` | Reconnect interval (ms) | `1000` |

## 🔒 Security Considerations

1. **Enable Authentication**: Configure username/password in production
2. **Use TLS**: Enable encrypted connections for sensitive data
3. **Topic ACLs**: Restrict which clients can publish/subscribe to topics
4. **Validate Payloads**: Always validate incoming MQTT messages

## 📚 Additional Resources

- [NestJS Microservices - MQTT](https://docs.nestjs.com/microservices/mqtt)
- [Eclipse Mosquitto Documentation](https://mosquitto.org/documentation/)
- [MQTT Protocol Specification](https://mqtt.org/mqtt-specification/)
