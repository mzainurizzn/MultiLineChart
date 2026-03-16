import { useEffect, useState } from "react";
import { useMqttTopic } from "./useMqttTopic";

export interface ChartPoint {
  ts: number;
  value: number;
}

export function useRealtimeChart(topic: string, maxPoints = 120) {
  const value = useMqttTopic(topic);

  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    if (value === null) return;

    const point = {
      ts: Date.now(),
      value,
    };

    setData((prev) => {
      const next = [...prev, point];

      if (next.length > maxPoints) {
        return next.slice(next.length - maxPoints);
      }

      return next;
    });
  }, [value, maxPoints]);

  return data;
}