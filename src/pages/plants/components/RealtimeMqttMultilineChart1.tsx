//Chart untuk Line Speed Mesin 3, 4 & 5

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

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileSpreadsheet } from "lucide-react";


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

type DataMode =
  | "realtime"
  | "1h"
  | "6h"
  | "12h"
  | "1d"
  | "3d"
  | "custom";

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

function getIntervalMinutes(mode: DataMode) {
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

function generateTimeTicks(data: MultiChartPoint[], mode: DataMode) {
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
    const [dataMode, setDataMode] = useState<DataMode>("realtime");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [nowTs, setNowTs] = useState(Date.now());
    const clientRef = useRef<MqttClient | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    // Tambahan
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const isCustom = dataMode === "custom";
    const isRealtime = dataMode === "realtime";

    // Export Excel DATA //

    const exportToExcel = () => {
    if (!data.length) return;

    // format data supaya rapi di Excel
    const formatted = data.map((row) => {
        const base: any = {
            Time: new Date(row.ts).toLocaleString(),
        };

        const topicMap: Record<string, string> = {
            "AMG/Speed/Line1": "M1",
            "AMG/Speed/Line6": "M6",
            "AMG/Speed/Line11": "M11",
        };

        topics.forEach((t) => {
            const label = topicMap[t] ?? t;
            base[label] = row[t] ?? 0;
        });

        return base;
    });

    // buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(formatted);

    // buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Line Speed");

    // convert ke buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, `Line_Speed_${Date.now()}.xlsx`);
    };
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
        if (dataMode !== "realtime") {
            // 🔥 stop MQTT kalau bukan realtime
            if (clientRef.current) {
                clientRef.current.end(true);
                clientRef.current = null;
            }
            return;
        }

    const interval = setInterval(() => {setNowTs(Date.now());}, 1000);

    return () => clearInterval(interval);

    }, [dataMode]);

    const chartHeight = isMobile ? 300 : height;
    const axisFontSize = isMobile ? 9 : 11; // contoh: 10px untuk mobile, 12px untuk desktop


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
            if (dataMode !== "realtime") return;

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
    }, [brokerUrl, topics, username, password, clientId, maxPoints, windowMinutes, dataMode]);

        
  
    //======= HISTORY=========/

    const [pendingData, setPendingData] = useState<MultiChartPoint[] | null>(null);

    useEffect(() => {
            if (!pendingData) return;

            const timeout = setTimeout(() => {
                setData(pendingData);
                setPendingData(null);
            }, 100); // kecil saja biar smooth

            return () => clearTimeout(timeout);
        }, [pendingData]);

    useEffect(() => {
            if (!historyBaseUrl) return;
    
            const controller = new AbortController();
    
            const load = async () => {
                setLoadingHistory(true);
    
                try {
                    const all: Record<string, MultiChartPoint[]> = {};
    
                    for (const t of topics) {
    
                        let url = "";
    
                        if (dataMode === "custom" && startDate && endDate) {
                            url = `${historyBaseUrl}/api/history?topic=${t}&start=${new Date(startDate).getTime()}&end=${new Date(endDate).getTime()}`;
                        } else {
                            const range =
                                dataMode === "realtime"
                                    ? "5m"
                                    : dataMode === "custom"
                                    ? null
                                    : dataMode;
                            url = `${historyBaseUrl}/api/history?topic=${t}&range=${range}`;
                        }
    
                        const res = await fetch(url, { signal: controller.signal });
                        const json: HistoryApiResponse = await res.json();
    
                        all[t] = (json.data || []).map((d) => {
                            const ts = new Date(d.ts || Date.now()).getTime();
                            return {
                                ts,
                                timeLabel: formatTimeLabel(new Date(ts)),
                                [t]: Number(d.value || 0),
                            };
                        });
                    }
    
                    const map = new Map<number, MultiChartPoint>();
    
                    topics.forEach((t) => {
                        all[t].forEach((row) => {
                            if (!map.has(row.ts)) {
                                map.set(row.ts, {
                                    ts: row.ts,
                                    timeLabel: row.timeLabel,
                                });
                            }
    
                            map.set(row.ts, {
                                ...map.get(row.ts)!,
                                [t]: row[t],
                            });
                        });
                    });
    
                    setPendingData(
                        Array.from(map.values()).sort((a, b) => a.ts - b.ts)
                    );
    
                } finally {
                    setLoadingHistory(false);
                }
            };
    
            load();
    
            return () => controller.abort();
    
        }, [dataMode, topics, historyBaseUrl, startDate, endDate]);

    const realtimeDomain = [
        nowTs - windowMinutes * 60 * 1000,
        nowTs
    ];

    const isActive = (m: DataMode) => dataMode === m;
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

    const gradients: Record<TopicKey, string> = {
        "AMG/Speed/Line1": "from-green-800 via-emerald-600 to-green-500",
        "AMG/Speed/Line6": "from-blue-800 via-blue-600 to-cyan-500",
        "AMG/Speed/Line11": "from-yellow-800 via-amber-500 to-yellow-400",
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

    const resetCustomRange = () => {
    setTempStartDate("");
    setTempEndDate("");
    setStartDate("");
    setEndDate("");
        };

    const   modeButton = (mode: DataMode, label: string) => (
        <button
            onClick={() => setDataMode(mode)}
            style={{
            padding: "5px 12px",
            fontSize: 12,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: isActive(mode)
                ? "linear-gradient(135deg, #34d399, #10b981)"
                : "transparent",
            color: isActive(mode) ? "#022c22" : "#ccc",
            fontWeight: 600,
            }}
        >
            {label}
        </button>
        );


        const getModeStyle = (active: boolean) => ({
            padding: "6px 12px",
            fontSize: 12,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: active
                ? "linear-gradient(135deg, #34d399, #10b981)"
                : "transparent",
            color: active ? "#022c22" : "#ccc",
            fontWeight: 600,
            });

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
                    marginBottom: 10,
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div
                    style={{
                        background: "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                        borderRadius: 12,
                        padding: "6px 14px",
                        display: "inline-block",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                    >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>
                        {title} &nbsp;&nbsp;&nbsp;
                    </div>

                    <div style={{ fontSize: 13, color: "#4ade80" }}>
                        <b>Server :</b> {status}</div>
                    </div>
                    </div>
                    

                    <div style={{ display: "flex", gap: 10  , fontSize: 13, flexWrap: "wrap",paddingTop:8,paddingLeft:6 }}>
                
                    <div>
                    <b style={{ color: "#facc15" }}>Mode :</b> {dataMode}
                    </div>
        
                {/*INPUT DATE*/}

               
                
                <div className="h-5.5 bg-gradient-to-r from-gray-700 via-gray-750 to-gray-800 border border-gray-700 rounded-xl px-0 py-0 w-[250px] sm:w-[250px]">
                    <div className="flex items-center px-2 text-gray-300 text-sm">
                        From : &nbsp;
                        <input
                        className="bg-transparent text-gray-100 outline-none ml-1"
                        type="datetime-local"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        />
                    </div>
                    </div>

                <div className="h-5.5 bg-gradient-to-r from-gray-700 via-gray-750 to-gray-800 border border-gray-700 rounded-xl px-0 py-0 w-[250px] sm:w-[250px]">
                    <div className="flex items-center px-2 text-gray-300 text-sm">
                     To &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:   &nbsp;
                <input
                    type="datetime-local"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                />
                </div>
                </div>

                
                 <div
                    style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    {/* GET DATA BUTTON */}
                    <button
                        onClick={() => {
                            setDataMode("custom");
                            setStartDate(tempStartDate);
                            setEndDate(tempEndDate);
                        }}
                        style={{
                            background: "linear-gradient(135deg, #34d399, #10b981)",
                            border: "none",
                            borderRadius: 5,
                            padding: "1px 8px",
                            color: "#022c22",
                            fontWeight: 600,
                            boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        Get Data
                    </button>

                    {/* EXPORT EXCEL BUTTON */}
                    <button
                        onClick={exportToExcel}
                        style={{
                            padding: "1px 8px",
                            borderRadius: 5,
                            border: "1px",
                            borderColor:"#10b981",
                            cursor: "pointer",
                            background: "linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
                            color: "black",
                            fontWeight: 600,
                            boxShadow: "0 4px 14px rgba(96,165,250,0.4)",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <FileSpreadsheet size={14} color="#0F9D58" />
                        Export
                    </button>
                </div>

                
                
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: isMobile?87:65.5,
                        right: 16,
                        zIndex: 1,
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


            <div
            style={{
                width: "100%",
                height: isMobile?chartHeight+65:chartHeight+25,
                position: "relative",
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))",
                borderRadius: 16,
                padding: 14,
                paddingBottom:isMobile?80:20,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.35)",
                zIndex: 1
            }}
            >
            <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={data}
                        margin={{ top: 8, right: 10, left: -28, bottom: 30 }}
                        
                    >

                    <defs>
                    {topics.map((t) => (
                        <linearGradient key={t} id={`grad-${t}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[t as TopicKey]} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={colors[t as TopicKey]} stopOpacity={0} />
                        </linearGradient>
                    ))}
                    </defs>
                    
                    <CartesianGrid
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="ts"
                        type="number"
                        scale="time"
                        domain={dataMode === "realtime" ? realtimeDomain : ["dataMin", "dataMax"]}
                        ticks={dataMode === "realtime" ? undefined : generateTimeTicks(data, dataMode)}
                        tickCount={dataMode === "realtime" ? 6 : undefined}
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
                                background: "rgba(15,23,42,0.9)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 5,
                                fontSize: 11,
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                boxShadow: "0 12px 25px rgba(0,0,0,0.5)"
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
                                    type="monotone"
                                    dataKey={t}
                                    name={topicLabels[t as TopicKey]}
                                    stroke={colors[t as TopicKey]}
                                    strokeWidth={1.2}
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
                {/* BUTTON MODE */}
           <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: -33,
                position: "relative",
                zIndex: 10,
                flexWrap: "wrap", // biar aman di mobile
            }}
            >

            {/* ✅ MODE (KIRI) */}
            <div
                style={{
                display: "inline-flex",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 4,
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                gap: 4,
                }}
            >
                {modeButton("realtime", "Live")}
                {modeButton("1h", "1h")}
                {modeButton("6h", "6h")}
                {modeButton("12h", "12h")}
                {modeButton("1d", "1d")}
                {modeButton("3d", "3d")}
            </div>

            {/* ✅ VISIBLE LINE (KANAN - TIDAK DIUBAH) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12 }}>VL :</div>

                <div className="flex gap-2 flex-wrap">
                {topics.map((t) => {
                    const key = t as TopicKey;
                    const isOn = visibleTopics[key];

                    return (
                    <button
                        key={t}
                        onClick={() => toggleTopic(key)}
                        style={{
                            background: isOn ? "#022c22" : "transparent",
                            color: isOn ? colors[key] : "#ccc",
                            border: `1px solid ${isOn ? colors[key] : "#4b5563"}`,
                            padding: "6px 12px",
                            fontSize: 12,
                            borderRadius: 8,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        >
                        {topicLabels[key]}
                        </button>
                    );
                })}
                </div>
            </div>

            </div>
            </div>
            

            

            {loadingHistory && (
                <div style={{ marginTop: 2, fontSize: 13, color: "#666" }}>
                    Loading history...
                </div>
            )}
        </div>
    );
}