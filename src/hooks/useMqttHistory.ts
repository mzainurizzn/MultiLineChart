import { useEffect, useState } from "react";

export interface ChartPoint {
  ts: number;
  value: number;
}

interface HistoryApiResponse {
  data?: Array<{
    ts?: number | string;
    value?: number | string;
  }>;
}

export function useMqttHistory(
  topic: string,
  historyBaseUrl: string,
  range: "5m" | "1h" | "6h" | "12h" | "1d" | "3d" = "5m"
) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!historyBaseUrl) return;

    const controller = new AbortController();

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const url = `${historyBaseUrl}/api/history?topic=${encodeURIComponent(
          topic
        )}&range=${range}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: HistoryApiResponse = await res.json();

        const normalized = (json.data ?? [])
          .map((row) => {
            const ts = row.ts ? new Date(row.ts).getTime() : Date.now();
            const value =
              typeof row.value === "number"
                ? row.value
                : typeof row.value === "string"
                ? Number(row.value)
                : NaN;

            if (!Number.isFinite(ts) || !Number.isFinite(value)) return null;
            return { ts, value };
          })
          .filter((v): v is ChartPoint => v !== null)
          .sort((a, b) => a.ts - b.ts);

        setData(normalized);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Fetch history error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    return () => controller.abort();
  }, [topic, historyBaseUrl, range]);

  return { data, loading };
}