import mqtt from "mqtt";

let client: mqtt.MqttClient | null = null;

export function getMqttClient(brokerUrl: string) {
  if (!client) {
    client = mqtt.connect(brokerUrl, {
      reconnectPeriod: 2000,
      connectTimeout: 5000,
      clean: true,
    });

    client.on("connect", () => {
      console.log("MQTT connected");
    });

    client.on("reconnect", () => {
      console.log("MQTT reconnecting...");
    });

    client.on("error", (err) => {
      console.error("MQTT error", err);
    });
  }

  return client;
}