//Chart untuk Line Speed Mesin 1, 6 & 11

import { useEffect, useMemo, useRef, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import {
    AreaChart,
    Area,
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

type MultiChartPoint = {
  ts: number;
  timeLabel: string;
  [key: string]: number | string; // dynamic line keys
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
    topics: string[];
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
    onValueUpdate?: (value: number | string) => void;
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

function ensureAllTopics(row: MultiChartPoint, topics: string[]) {
  const base: MultiChartPoint = {
    ts: row.ts,
    timeLabel: row.timeLabel,
  };

  topics.forEach((t) => {
    base[t] = row[t] ?? 0;   // 🔥 INI PENTING
  });

  return base;
}


function normalizeHistoryRows(
  rows: HistoryApiResponse["data"] = [],
  topic: string
): MultiChartPoint[] {
  return rows
    .map((row) => {
      const tsRaw = row.ts ?? Date.now();
      const ts = getBucketTs(new Date(tsRaw).getTime(), 5);

      const value =
        typeof row.value === "number"
          ? row.value
          : typeof row.value === "string"
          ? Number(row.value)
          : NaN;

      if (!Number.isFinite(ts) || !Number.isFinite(value)) return null;

      return {
        ts,
        timeLabel: row.timeLabel || formatTimeLabel(new Date(ts)),
        [topic]: value, // ✅ INI KUNCINYA
      };
    })
    .filter((item): item is MultiChartPoint => item !== null);
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

function getBucketTs(ts: number, seconds = 5) {
  return Math.floor(ts / (seconds * 1000)) * (seconds * 1000);
}

function generateTimeTicks(data: MultiChartPoint[], mode: ChartMode) {
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
    topics,
    username,
    password,
    clientId,
    title = "Trend Speed Machine 1, 6 dan 11",
    maxPoints = 120,
    windowMinutes = 5,
    height = 320,
    yDomain = [0, 1000],
    historyBaseUrl,
}: 

RealtimeMqttLineChartProps) {
    const [data, setData] = useState<MultiChartPoint[]>([]);
    const [status, setStatus] = useState("disconnected");
    const [mode, setMode] = useState<ChartMode>("realtime");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [nowTs, setNowTs] = useState(Date.now());
    const clientRef = useRef<MqttClient | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [visibleTopics, setVisibleTopics] = useState<Record<TopicKey, boolean>>({
        "AMG/Speed/Line1": true,
        "AMG/Speed/Line6": true,
        "AMG/Speed/Line11": true,
    });

    const toggleTopic = (topic: TopicKey) => {
    setVisibleTopics((prev) => ({
        ...prev,
        [topic]: !prev[topic],
    }));
    };

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleLandscape = async () => {
        try {
            if (!document.fullscreenElement) {
                // masuk fullscreen
                await document.documentElement.requestFullscreen();

                // lock landscape (kalau support)
                // @ts-ignore
                if (screen.orientation?.lock) {
                    await screen.orientation.lock("landscape");
                }

                setIsFullscreen(true);
            } else {
                // keluar fullscreen
                await document.exitFullscreen();

                // unlock orientation (kalau support)
                // @ts-ignore
                if (screen.orientation?.unlock) {
                    screen.orientation.unlock();
                }

                setIsFullscreen(false);
            }
        } catch (err) {
            console.warn("Fullscreen/orientation error:", err);
        }
        };
    
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
                 topics.forEach((t) => {
                 client.subscribe(t);
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

        client.on("message", (incomingTopic, message) => {
            if (mode !== "realtime") return;

            const raw = message.toString();
            const parsed = parsePayload(raw);

            const value = parsed.value;
            if (value === null || value === undefined) return;

            setData((prev) => {
            const cutoff = Date.now() - windowMinutes * 60 * 1000;

            const ts = getBucketTs(parsed.ts, 5); // ✅ BUCKET

            let found = false;

            const updated: MultiChartPoint[] = prev.map((item) => {
                if (item.ts === ts) { // ❗ tidak perlu Math.abs lagi
                found = true;
                return {
                    ...item,
                    [incomingTopic]: value,
                };
                }
                return item;
            });

            if (!found) {
                const newRow: MultiChartPoint = {
                    ts,
                    timeLabel: formatTimeLabel(new Date(ts)),
                };

                topics.forEach((t) => {
                    newRow[t] = 0; // 🔥 penting supaya line stabil
                });

                newRow[incomingTopic] = value;

                updated.push(newRow);
                }

            const filtered = updated.filter((d) => d.ts >= cutoff);

            return filtered.length > maxPoints
                ? filtered.slice(filtered.length - maxPoints)
                : filtered;
            });
                        });

        return () => {
            client.end(true);
            clientRef.current = null;
        };
    }, [brokerUrl, topics, username, password, clientId, maxPoints, windowMinutes, mode]);

    useEffect(() => {
    if (!historyBaseUrl) return;

    const controller = new AbortController();

    

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);

            let rangeParam = mode === "realtime" ? "5m" : mode;

            const allData: Record<string, MultiChartPoint[]> = {};

            for (const t of topics) {
            const url = `${historyBaseUrl}/api/history?topic=${encodeURIComponent(t)}&range=${rangeParam}`;
            const res = await fetch(url);
            const json = await res.json();

            allData[t] = normalizeHistoryRows(json.data,t);
            }

            // merge by timestamp
            const map = new Map<number, MultiChartPoint>();

            topics.forEach((t) => {
                allData[t].forEach((row) => {
                    if (!map.has(row.ts)) {
                    map.set(row.ts, {
                        ts: row.ts,
                        timeLabel: row.timeLabel,
                    });
                    }

                const existing = map.get(row.ts)!;

                    map.set(row.ts, {
                    ...existing,
                    [t]: row[t],   // atau row.value
                    });
                });
                });

            const merged = Array.from(map.values()).sort((a, b) => a.ts - b.ts);

            setData(merged);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
        };

    loadHistory();

    return () => controller.abort();
}, [mode, topics, historyBaseUrl]);

    const realtimeDomain = [
        nowTs - windowMinutes * 60 * 1000,
        nowTs
    ];

    const latestValue = useMemo(() => {
        if (!data.length) return "-";

        const last = data[data.length - 1];

        return topics
            .map((t) => last[t] ?? "-")
            .join(" | ");
        }, [data, topics]);

    type TopicKey =
        | "AMG/Speed/Line1"
        | "AMG/Speed/Line6"
        | "AMG/Speed/Line11";

    const colors: Record<TopicKey, string> = {
        "AMG/Speed/Line1": "#00ff00",
        "AMG/Speed/Line6": "#00bfff",
        "AMG/Speed/Line11": "#ffcc00",
    };

    const topicLabels: Record<TopicKey, string> = {
        "AMG/Speed/Line1": "M1",
        "AMG/Speed/Line6": "M6",
        "AMG/Speed/Line11": "M11",
    };

    const buttonStyle = {
        padding: isMobile ? "6px 10px" : "8px 12px",
        fontSize: isMobile ? "12px" : "13px",
        borderRadius: 8,
        border: "1px solid #ccc",
        cursor: "pointer",
        };

    const iconStyle = {
        fontSize: "14px",
        lineHeight: 1,
        };

    return (
        <div
            style={{
                width: "100%",
                position: "relative",
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
                    <div style={{ display: "flex", gap: 16, fontSize: 14, flexWrap: "wrap" }}>
                    <div>
                        <b style={{ color: "#00ff00" }}>Status :</b> {status}
                    </div>
                    <div>
                        <b style={{ color: "#ffcc00" }}>Mode :</b> {mode}
                    </div>
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 45,
                        right: 15,
                        zIndex: 9999,
                    }}
                >
                    <button
                        onClick={toggleLandscape}
                        style={{
                            padding: "2px 8px",
                            borderRadius: 5,
                            border: "1px solid #ccc",
                            background: "transparent",
                            color: "#fff",
                            fontSize: "12px",
                            opacity: 0.75,
                            cursor: "pointer",

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                    
                        <button style={iconStyle}>
                            {isFullscreen ? "⤡" : "⛶"}
                            </button>
                    </button>
                </div>

                </div>

                
            </div>

            <div style={{ width: "100%", height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={data}
                        margin={{ top: 8, right: 10, left: -28, bottom: 10 }}
                    >

                    <defs>
                    {topics.map((t) => (
                        <linearGradient key={t} id={`grad-${t}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[t as TopicKey]} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={colors[t as TopicKey]} stopOpacity={0} />
                        </linearGradient>
                    ))}
                    </defs>
                    
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
                            ticks={[0, 200, 400, 600, 800, 1000]}
                            tick={{ fill: "#ffffff",fontSize: axisFontSize }}
                        />
                        <Tooltip
                        
                            contentStyle={{
                                background:"none", //"rgba(20,20,20,0.95)",
                                border: "none",//"0.5px solid rgba(255,255,255,0.08)",//
                                borderRadius: 8,
                                color: "#fff",
                                fontSize: "13px"
                            }}
                            labelFormatter={(label) => {
                                const ts = Number(label);
                                const d = new Date(ts);

                                return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
                            }}
                            
                            
                            
                            formatter={(value, name) => [
                                `${Number(value)} p/min`,
                                name, // ✅ ini sekarang M1 / M6 / M11
                            ]}
/>

                        {topics.map((t) => (
                            visibleTopics[t as TopicKey] && (
                                <Area
                                    key={t}
                                    type="linear"
                                    dataKey={t}
                                    name={topicLabels[t as TopicKey]}
                                    stroke={colors[t as TopicKey]}
                                    strokeWidth={1}
                                    fill={`url(#grad-${t})`}
                                    fillOpacity={0.8}
                                    isAnimationActive={false}
                                    dot={false}
                                    connectNulls
                                />
                            )
                        ))}
                    </AreaChart>
                   
                </ResponsiveContainer>
            </div>
            {/* BUTTON MODE */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    onClick={() => setMode("realtime")}
                    style={{
                        ...buttonStyle,
                        background: mode === "realtime" ? "#1677ff" : "transparent",
                        color: mode === "realtime" ? "#fff" : "#fff",
                    }}
                >
                    Live
                </button>

                <button
                    onClick={() => setMode("1h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "1h" ? "#1677ff" : "transparent",
                        color: mode === "1h" ? "#fff" : "#fff",
                    }}
                >
                    1h
                </button>

                <button
                    onClick={() => setMode("6h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "6h" ? "#1677ff" : "transparent",
                        color: mode === "6h" ? "#fff" : "#fff",
                    }}
                >
                    6h
                </button>

                <button
                    onClick={() => setMode("12h")}
                    style={{
                        ...buttonStyle,
                        background: mode === "12h" ? "#1677ff" : "transparent",
                        color: mode === "12h" ? "#fff" : "#fff",
                    }}
                >
                    12h
                </button>

                <button
                    onClick={() => setMode("1d")}
                    style={{
                        ...buttonStyle,
                        background: mode === "1d" ? "#1677ff" : "transparent",
                        color: mode === "1d" ? "#fff" : "#fff",
                    }}
                >
                    1d
                </button>

                <button
                    onClick={() => setMode("3d")}
                    style={{
                        ...buttonStyle,
                        background: mode === "3d" ? "#1677ff" : "transparent",
                        color: mode === "3d" ? "#fff" : "#fff",
                    }}
                >
                    3d
                </button>

                {/* SPACER */}
                <div style={{ width: 10 }} />
                <div style={{ padding: "6px",fontSize: 12, fontWeight: 400,alignItems: "center"}}> Visible Line :</div>

                {/* TOGGLE BUTTON */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {topics.map((t) => {
                        const key = t as TopicKey;

                        return (
                            <button
                                key={t}
                                onClick={() => toggleTopic(key)}
                                style={{
                                    ...buttonStyle,
                                    background: visibleTopics[key] ? colors[key] : "transparent",
                                    color: visibleTopics[key] ? "#000" : "#fff",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 400,  
                                }}
                            >
                                {topicLabels[key]} {visibleTopics[key]}
                            </button>
                        );
                    })}
                </div>
            </div>


            

            {loadingHistory && (
                <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                    Loading history...
                </div>
            )}
        </div>
    );
}