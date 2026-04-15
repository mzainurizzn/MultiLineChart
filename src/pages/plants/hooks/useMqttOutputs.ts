import { useEffect, useState } from "react";
import { getMqttClient } from "../../../services/mqttService";
import { topicMap, MqttData, MqttDataKey } from "../../../services/mqttTopics";

let isSubscribed = false;

export function useMqttOutputs(): MqttData {
  const [data, setData] = useState<MqttData>({} as MqttData);

  useEffect(() => {
    const client = getMqttClient();

    if (!isSubscribed) {
      Object.keys(topicMap).forEach((topic) => {
        client.subscribe(topic);
      });
      isSubscribed = true;
    }

    const handler = (topic: string, message: Buffer) => {
      if (topic in topicMap) {
        const key = topicMap[topic as keyof typeof topicMap] as MqttDataKey;
        const value = Number(message.toString());

        // ✅ prev sekarang typed
        setData((prev: MqttData) => ({
          ...prev,
          [key]: value,
        }));
      }
    };

    client.on("message", handler);

    return () => {
      client.off("message", handler);
    };
  }, []);

  return data;
}