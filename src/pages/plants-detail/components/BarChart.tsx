import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ReferenceLine,
  Legend,
  LabelList,
} from "recharts";

type TargetLabelPosition = "left" | "right" | "center";

export type MonthlyOeeCu = {
  month: number;
  label: string;
  oee: number;
  cu: number;
  oeeTgt: number;
  cuTgt: number;
};

export type BarChartTheme = {
  primary?: string;
  barStart?: string;
  barEnd?: string;
  targetLine?: string;
  targetLineDark?: string;
  axisLineDark?: string;
  axisLineLight?: string;
  labelDark?: string;
  labelLight?: string;
};

type BarChartProps = {
  data: MonthlyOeeCu[];
  metric?: "oee" | "cu";
  title?: string;
  theme?: BarChartTheme;
  targetLabelPos?: TargetLabelPosition; // disiapkan biar mirip RN (optional)
  targetLabelOffsetX?: number;
  targetLabelOffsetY?: number;
  yDomain?: [number, number];
  ketPlant?: string;
  ketKpi?: string;
};

/** Helpers */
const monthShort = (m: number) =>
  new Date(2023, m - 1).toLocaleString("default", { month: "short" });

const monthLong = (m: number) =>
  new Date(2023, m - 1).toLocaleString("default", { month: "long" });

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Tooltip putih seperti di RN */
function TooltipCard({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: any[];
  label?: any;
  metric: "oee" | "cu";
}) {
  if (!active || !payload || payload.length === 0) return null;

  // payload[0].payload adalah row data
  const row = payload[0]?.payload as any;
  const m = Number(row?.month);
  const actual = Number(row?.[metric]);
  const target = Number(row?.target);

  const metricLabel = metric === "oee" ? "OEE per Month (%)" : "CU per Month (%)";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #00000014",
        padding: 12,
        maxWidth:150,
        boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
        minWidth: 200,
      }}
    >
      <div style={{ fontWeight: 900, color: "black", marginBottom: 8 }}>
        {m >= 1 && m <= 12 ? monthLong(m) : String(label ?? "-")}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 6 }}>
        <div style={{ color: "black", opacity: 0.7,fontSize: 12 }}>{metricLabel}</div>
        <div style={{ fontWeight: 900, color: "black",fontSize: 12 }}>
          {Number.isFinite(actual) ? `${actual.toFixed(2)}%` : "-"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 6 }}>
        <div style={{ color: "black", opacity: 0.7,fontSize: 12 }}>Target</div>
        <div style={{ fontWeight: 900, color: "black",fontSize: 12 }}>
          {Number.isFinite(target) ? `${target.toFixed(2)}%` : "-"}
        </div>
      </div>
    </div>
  );
}

/** label tengah bar (mirip Skia Text) */
function InsideBarValueLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (!Number.isFinite(value)) return null;

  // posisi tengah bar
  const cx = x + width / 2;
  const cy = y + height / 2;

  // jika bar terlalu kecil, tetap tampil tapi agak digeser
  const dy = height < 18 ? -6 : 4;

  return (
    <text
      x={cx}
      y={cy + dy}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="rgba(255,255,255,0.92)"
      fontSize={10}
      fontWeight={800}
    >
      {`${Number(value).toFixed(1)}%`}
    </text>
  );
}

/** label target di atas titik */
function TargetLabel(props: any) {
  const { x, y, value } = props; // value = target
  if (!Number.isFinite(value)) return null;

  return (
    <text
      x={x}
      y={y - 10}
      textAnchor="middle"
      fill="rgba(255, 251, 0, 0.95)"
      fontSize={10}
      fontWeight={800}
    >
      {`${Number(value).toFixed(1)}%`}
    </text>
  );
}

export const BarChart = ({
  data,
  metric = "oee",
  title = "OEE vs Target per Bulan",
  theme,
  yDomain = [0, 100],
  ketPlant = "",
  ketKpi = "",
}: BarChartProps) => {
  // theme warna (samakan feel RN)
  const barStart = theme?.barStart ?? "#ffaa00ff";
  const barEnd = theme?.barEnd ?? "#ffaa0018";
  const targetLineColor = theme?.targetLineDark ?? "#fffb00ff"; // mirip RN dark
  const axisLineColor = theme?.axisLineDark ?? "#71717a";
  const labelColor = theme?.labelDark ?? "white";

  const targetKey = metric === "cu" ? "cuTgt" : "oeeTgt";

  // bentuk data untuk recharts
  const chartData = useMemo(() => {
    return (data ?? []).map((d) => ({
      ...d,
      xLabel: monthShort(d.month),
      actual: Number(d[metric]) || 0,
      target: Number((d as any)[targetKey]) || 0,
    }));
  }, [data, metric, targetKey]);

  const gradientId = `grad_${metric}`;

  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="font-extrabold text-white">{title}</div>

      {metric === "cu" && (
        <div className="text-xs mt-1" style={{ color: labelColor, opacity: 0.7 }}>
          {ketPlant}
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="mt-3 text-white/60">No data available</div>
      ) : (
        <div className="relative mt-2" style={{ height: 275 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 22, right: 18, left: 6, bottom: 12 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={barStart} stopOpacity={1} />
                  <stop offset="100%" stopColor={barEnd} stopOpacity={1} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

              <XAxis
                dataKey="month"
                tickFormatter={(v) => monthShort(Number(v))}
                tick={{ fill: labelColor, opacity: 0.85, fontSize: 10, fontWeight: 700 }}
                axisLine={{ stroke: axisLineColor, opacity: 0.5 }}
                tickLine={{ stroke: axisLineColor, opacity: 0.35 }}
              />

              <YAxis
                domain={[yDomain[0], yDomain[1]]}
                tick={{ fill: labelColor, opacity: 0.7, fontSize: 10, fontWeight: 700 }}
                axisLine={{ stroke: axisLineColor, opacity: 0.5 }}
                tickLine={{ stroke: axisLineColor, opacity: 0.35 }}
                width={34}
              />

              {/* Tooltip putih */}
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
                content={<TooltipCard metric={metric} />}
                wrapperStyle={{ outline: "none" }}
              />

              {/* Legend 2 titik */}
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: labelColor, fontSize: 12, fontWeight: 700 }}>
                    {value === "actual" ? "Actual" : "Target"}
                  </span>
                )}
              />

              {/* Bar Actual */}
              <Bar
                dataKey="actual"
                name="actual"
                fill={`url(#${gradientId})`}
                radius={[8, 8, 0, 0]}
                maxBarSize={35}
                isAnimationActive
                animationDuration={500}
              >
                <LabelList dataKey="actual" content={<InsideBarValueLabel />} />
              </Bar>

              {/* Target line dashed + dot */}
              <Line
                type="linear"
                dataKey="target"
                name="target"
                stroke={targetLineColor}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3, stroke: targetLineColor, fill: targetLineColor }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
                label={<TargetLabel />}
              />

              {/* (opsional) kamu bisa tambahkan reference line target rata-rata, tapi di mobile kamu per bulan */}
              {/* <ReferenceLine y={someTarget} stroke={targetLineColor} /> */}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-[10px] mt-2" style={{ color: labelColor, opacity: 0.7 }}>
        {ketKpi}
      </div>
    </div>
  );
};
