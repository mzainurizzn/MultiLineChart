//Chart untuk Line Speed Mesin 3, 4 & 5

import { useEffect, useMemo, useRef, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type MqttPayload =
    | number
    | string
    | {
        value?: number | string;
        ts?: string | number;
        time?: string | number;
        timestamp?: string | number;
        [key: string]: unknown;
    };

type ChartPoint = {
    timeLabel: string;
    value: number;
    ts: number;
};

type ChartMode = "realtime" | "5m" | "1h" | "6h" | "12h" | "1d" | "3d";

interface HistoryApiResponse {
    data?: Array<{
        timeLabel?: string;
        value?: number | string;
        ts?: string | number;
    }>;
}

interface RealtimeMqttLineChartProps {
    brokerUrl: string;
    topic: string;
    username?: string;
    password?: string;
    clientId?: string;
    title?: string;
    maxPoints?: number;
    windowMinutes?: number;
    height?: number;
    yDomain?: [number | "auto", number | "auto"];
    lineName?: string;
    historyBaseUrl?: string; // contoh: http://172.20.10.5:1880
}

function formatTimeLabel(date: Date) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}

function parsePayload(raw: string): { value: number | null; ts: number } {
    const now = Date.now();

    try {
        const parsed = JSON.parse(raw) as MqttPayload;

        if (typeof parsed === "number") {
            return { value: parsed, ts: now };
        }

        if (typeof parsed === "string") {
            const n = Number(parsed);
            return { value: Number.isFinite(n) ? n : null, ts: now };
        }

        const rawValue = parsed.value;
        const numericValue =
            typeof rawValue === "number"
                ? rawValue
                : typeof rawValue === "string"
                    ? Number(rawValue)
                    : NaN;

        const rawTs = parsed.ts ?? parsed.time ?? parsed.timestamp;
        const ts =
            typeof rawTs === "string" || typeof rawTs === "number"
                ? new Date(rawTs).getTime()
                : now;

        return {
            value: Number.isFinite(numericValue) ? numericValue : null,
            ts: Number.isFinite(ts) ? ts : now,
        };
    } catch {
        const n = Number(raw);
        return { value: Number.isFinite(n) ? n : null, ts: now };
    }
}

function normalizeHistoryRows(rows: HistoryApiResponse["data"] = []): ChartPoint[] {
    return rows
        .map((row) => {
            const tsRaw = row.ts ?? Date.now();
            const ts = new Date(tsRaw).getTime();
            const value =
                typeof row.value === "number"
                    ? row.value
                    : typeof row.value === "string"
                        ? Number(row.value)
                        : NaN;

            if (!Number.isFinite(ts) || !Number.isFinite(value)) return null;

            return {
                ts,
                value,
                timeLabel: row.timeLabel || formatTimeLabel(new Date(ts)),
            };
        })
        .filter((item): item is ChartPoint => item !== null)
        .sort((a, b) => a.ts - b.ts);
}

function getIntervalMinutes(mode: ChartMode) {
    switch (mode) {
        case "realtime":
            return 1;   // tiap 1 menit
        case "1h":
            return 10;   // tiap 10 menit
        case "6h":
            return 60;  // tiap 60 menit
        case "12h":
            return 120;  // tiap 120 menit
        case "1d":
            return 240;  // tiap 4 jam
        case "3d":
            return 720;  // tiap 12 jam
        default:
            return 5;
    }
}

function generateTimeTicks(data: ChartPoint[], mode: ChartMode) {
    if (!data.length) return [];

    const interval = getIntervalMinutes(mode);

    const start = new Date(data[0].ts);
    const end = new Date(data[data.length - 1].ts);

    const ticks: number[] = [];

    const current = new Date(start);

    current.setSeconds(0);
    current.setMilliseconds(0);

    // ⬇️ gunakan CEIL supaya tick tidak sebelum data
    current.setMinutes(
        Math.ceil(current.getMinutes() / interval) * interval
    );

    while (current <= end) {
        ticks.push(current.getTime());
        current.setMinutes(current.getMinutes() + interval);
    }

    return ticks;
}

export default function RealtimeMqttLineChart({
    brokerUrl,
    topic,
    username,
    password,
    clientId,
    title = "Realtime MQTT Chart",
    maxPoints = 120,
    windowMinutes = 5,
    height = 320,
    yDomain = [0, 500],
    lineName = "Value",
    historyBaseUrl,
}: RealtimeMqttLineChartProps) {
    const [data, setData] = useState<ChartPoint[]>([]);
    const [status, setStatus] = useState("disconnected");
    const [mode, setMode] = useState<ChartMode>("realtime");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [nowTs, setNowTs] = useState(Date.now());
    const clientRef = useRef<MqttClient | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

useEffect(() => {
    if (mode !== "realtime") return;

    const interval = setInterval(() => {
        setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(interval);

}, [mode]);
    const chartHeight = isMobile ? 280 : height;
    const axisFontSize = isMobile ? 10 : 12; // contoh: 10px untuk mobile, 12px untuk desktop


    useEffect(() => {
        const id = clientId || `web_${Math.random().toString(16).slice(2, 10)}`;

        const client = mqtt.connect(brokerUrl, {
            clientId: id,
            username,
            password,
            reconnectPeriod: 1000,
            connectTimeout: 5000,
            clean: true,
        });

        clientRef.current = client;

        client.on("connect", () => {
            setStatus("Online");
            client.subscribe(topic, { qos: 0 }, (err) => {
                if (err) {
                    console.error("Subscribe error:", err);
                }
            });
        });

        client.on("reconnect", () => {
            setStatus("reconnecting");
        });

        client.on("close", () => {
            setStatus("Offline");
        });

        client.on("error", (err) => {
            console.error("MQTT error:", err);
            setStatus("error");
        });

        client.on("message", (_topic, message) => {
            if (mode !== "realtime") return;

            const raw = message.toString();
            const parsed = parsePayload(raw);

            if (parsed.value === null) return;

            const point: ChartPoint = {
                timeLabel: formatTimeLabel(new Date(parsed.ts)),
                value: parsed.value,
                ts: parsed.ts,
            };

            setData((prev) => {
                const cutoff = Date.now() - windowMinutes * 60 * 1000;
                const merged = [...prev, point].filter((item) => item.ts >= cutoff);

                if (merged.length > maxPoints) {
                    return merged.slice(merged.length - maxPoints);
                }

                return merged;
            });
        });

        return () => {
            client.end(true);
            clientRef.current = null;
        };
    }, [brokerUrl, topic, username, password, clientId, maxPoints, windowMinutes, mode]);

    useEffect(() => {
    if (!historyBaseUrl) return;

    const controller = new AbortController();

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);

            // default: kirim range sesuai mode
            let rangeParam = mode;

            if (mode === "realtime") {
                rangeParam = "5m"; // ambil 5 menit terakhir
            }

            // khusus 1d → server biasanya pakai 1d
            if (mode === "1d") 
                rangeParam = "1d";
            if (mode === "3d") 
                rangeParam = "3d";
            
            const url = `${historyBaseUrl}/api/history?topic=${encodeURIComponent(topic)}&range=${rangeParam}`;

            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json: HistoryApiResponse = await res.json();
            setData(normalizeHistoryRows(json.data));
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Load history error:", err);
            }
        } finally {
            setLoadingHistory(false);
        }
    };

    loadHistory();

    return () => controller.abort();
}, [mode, topic, historyBaseUrl]);

    const realtimeDomain = [
        nowTs - windowMinutes * 60 * 1000,
        nowTs
    ];

    const latestValue = useMemo(() => {
        if (!data.length) return "-";
        return data[data.length - 1].value;
    }, [data]);

    const buttonStyle = {
        padding: isMobile ? "6px 10px" : "8px 12px",
        fontSize: isMobile ? "12px" : "13px",
        borderRadius: 8,
        border: "1px solid #ccc",
        cursor: "pointer",
        };

    return (
        <div
            style={{
                width: "100%",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                padding: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                color: "white"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "#ffffff" }}>Topic: {topic}</div>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 14, flexWrap: "wrap" }}>
                    <div>
                        <b>Status:</b> {status}
                    </div>
                    <div>
                        <b>Mode:</b> {mode}
                    </div>
                    <div>
                        <b>Speed:</b> {String(latestValue)} p/min
                    </div>
                </div>
            </div>

            <div style={{ width: "100%", height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 8, right: 10, left: -28, bottom: 10 }}
                    >
                    
                    <XAxis
                        dataKey="ts"
                        type="number"
                        scale="time"
                        domain={mode === "realtime" ? realtimeDomain : ["dataMin", "dataMax"]}
                        ticks={mode === "realtime" ? undefined : generateTimeTicks(data, mode)}
                        tickCount={mode === "realtime" ? 6 : undefined}
                        tickFormatter={(ts) => {
                            const d = new Date(ts);
                            return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
                        }}
                        tick={{ fill: "#ffffff", fontSize: axisFontSize }}
                    />
                        <YAxis 
                            domain={yDomain} 
                            ticks={[0, 100, 200, 300, 400, 500]}
                            tick={{ fill: "#ffffff",fontSize: axisFontSize }}
                        />
                        <Tooltip
                            contentStyle={{
                                background:"none", //"rgba(20,20,20,0.95)",
                                border: "none",//"0.5px solid rgba(255,255,255,0.08)",//
                                borderRadius: 8,
                                color: "#fff",
                            }}
                            labelFormatter={(label) => {
                                const ts = Number(label);
                                const d = new Date(ts);

                                return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
                            }}
                            formatter={(value) => [`${Number(value)} p/min`, lineName]}
/>
                        <Line
                            type="monotone"
                            dataKey="value"
                            name={lineName}
                            dot={false}
                            isAnimationActive={false}
                            stroke="#00ff00"
                            strokeWidth={1}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    onClick={() => setMode("realtime")}
                    style={{
                        ...buttonStyle,
                        background: mode === "realtime" ? "#1677ff" : "#f3f3f3",
                        color: mode === "realtime" ? "#fff" : "#000",
                    }}
                >
                    Realtime
                </button>

                <button
                    onClick={() => setMode("1h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "1h" ? "#1677ff" : "#f3f3f3",
                        color: mode === "1h" ? "#fff" : "#000",
                    }}
                >
                    1h
                </button>

                <button
                    onClick={() => setMode("6h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "6h" ? "#1677ff" : "#f3f3f3",
                        color: mode === "6h" ? "#fff" : "#000",
                    }}
                >
                    6h
                </button>

                <button
                    onClick={() => setMode("12h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "12h" ? "#1677ff" : "#f3f3f3",
                        color: mode === "12h" ? "#fff" : "#000",
                    }}
                >
                    12h
                </button>

                <button
                    onClick={() => setMode("1d")}
                    style={{
                        ...buttonStyle,
                        background: mode === "1d" ? "#1677ff" : "#f3f3f3",
                        color: mode === "1d" ? "#fff" : "#000",
                    }}
                >
                    1d
                </button>

                <button
                    onClick={() => setMode("3d")}
                    style={{
                        ...buttonStyle,
                        background: mode === "3d" ? "#1677ff" : "#f3f3f3",
                        color: mode === "3d" ? "#fff" : "#000",
                    }}
                >
                    3d
                </button>
            </div>


            {loadingHistory && (
                <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                    Loading history...
                </div>
            )}
        </div>
    );
}