import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_CLIENT, getMqttConfig } from './mqtt.config';
import { MqttPublisherService } from './mqtt-publisher.service';
import { MqttSubscriberService } from './mqtt-subscriber.service';
import { MqttEventListener } from './mqtt-event.listener';
import { MqttController } from './mqtt.controller';

/**
 * MqttModule
 *
 * This module provides MQTT functionality for the application.
 *
 * Features:
 * - MQTT client connection management
 * - Message publishing to MQTT topics
 * - Message subscription and handling
 * - Event-based decoupling of MQTT messages
 * - REST API for interacting with MQTT
 *
 * Usage:
 * 1. Import MqttModule in your AppModule
 * 2. Inject MqttPublisherService to publish messages
 * 3. Use MessagePattern decorators in MqttSubscriberService to handle incoming messages
 * 4. Listen to MQTT_EVENTS using @OnEvent decorators
 *
 * Environment Variables:
 * - MQTT_HOST: MQTT broker host (default: localhost)
 * - MQTT_PORT: MQTT broker port (default: 1883)
 * - MQTT_USERNAME: MQTT username (optional)
 * - MQTT_PASSWORD: MQTT password (optional)
 * - MQTT_CLIENT_ID: Client identifier (default: auto-generated)
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MQTT_CLIENT,
        useFactory: () => {
          const config = getMqttConfig();
          return {
            transport: Transport.MQTT,
            options: {
              url: `mqtt://${config.host}:${config.port}`,
              username: config.username,
              password: config.password,
              clientId: config.clientId,
              clean: true,
              connectTimeout: 4000,
              reconnectPeriod: 1000,
            },
          };
        },
      },
    ]),
  ],
  controllers: [MqttController],
  providers: [MqttPublisherService, MqttSubscriberService, MqttEventListener],
  exports: [MqttPublisherService, MqttSubscriberService, MqttEventListener],
})
export class MqttModule {}
