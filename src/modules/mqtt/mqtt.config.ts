import { Transport, MqttOptions } from '@nestjs/microservices';

export const MQTT_CLIENT = 'MQTT_CLIENT';

export interface MqttConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  clientId: string;
}

export const getMqttConfig = (): MqttConfig => ({
  host: process.env.MQTT_HOST || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883', 10),
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: process.env.MQTT_CLIENT_ID || `nestjs-mqtt-${Date.now()}`,
});

export const getMqttClientOptions = (): MqttOptions => {
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
};
