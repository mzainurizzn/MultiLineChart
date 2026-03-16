import { useEffect, useState } from "react";
import { getMqttClient } from "../lib/mqttClient";

export function useMqttTopic(topic: string) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const client = getMqttClient();

    const handler = (msgTopic: string, payload: Buffer) => {
      if (msgTopic !== topic) return;

      const raw = payload.toString();
      const num = Number(raw);

      if (!Number.isNaN(num)) {
        setValue(num);
      }
    };

    client.subscribe(topic);
    client.on("message", handler);

    return () => {
      client.off("message", handler);
    };
  }, [topic]);

  return value;
}