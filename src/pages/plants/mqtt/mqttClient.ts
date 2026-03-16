import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function getMqttClient() {
  if (!client) {
    client = mqtt.connect("ws://172.17.173.164:443", {
      reconnectPeriod: 2000,
      connectTimeout: 5000,
      clean: true,
    });

    client.on("connect", () => {
      console.log("MQTT Connected");
    });

    client.on("reconnect", () => {
      console.log("MQTT Reconnecting...");
    });

    client.on("error", (err) => {
      console.error("MQTT Error", err);
    });
  }

  return client;
}