import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (!client) {
    client = mqtt.connect("ws://172.17.173.164:443");

    client.on("connect", () => {
      console.log("MQTT Connected");
    });

    client.on("error", (err: Error) => {
      console.error("MQTT Error:", err);
    });
  }

  return client;
}