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
  Legend,
  LabelList,
} from "recharts";

type Theme = {
  primary?: string;
  barStart?: string;
  barEnd?: string;
  axisLineDark?: string;
  axisLineLight?: string;
  labelDark?: string;
  labelLight?: string;
  targetLine?: string;
  targetLineDark?: string;
};

type OeeMonthlyLike = {
  year: number;
  oee: number | null;
  cu: number | null;
  tgt_oee?: number | null;
  tgt_cu?: number | null;
};

type Props = {
  title?: string;
  data: OeeMonthlyLike[];
  metric?: "oee" | "cu";

  years?: number[];
  yearRange?: [number, number];

  mode?: "avg" | "sum";
  ignoreZero?: boolean;

  theme?: Theme;
  yDomain?: [number, number];
  ketYTD?: string;
};

type YearTotalItem = {
  year: number;
  yearLabel: string;
  value: number;
  hasData: boolean;
  target: number | null;
};

function TooltipCard({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const row = payload[0]?.payload as YearTotalItem;
  if (!row) return null;

  const actual = row.hasData ? row.value : null;
  const target = row.target;
  const gap = actual !== null && target !== null ? actual - target : null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #00000014",
        padding: 12,
        boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
        minWidth: 220,
      }}
    >
      <div style={{ fontWeight: 900, color: "black", marginBottom: 8 }}>
        {row.yearLabel}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 6 }}>
        <div style={{ color: "black", opacity: 0.7 }}>Actual</div>
        <div style={{ fontWeight: 900, color: "black" }}>
          {actual !== null ? `${actual.toFixed(1)}%` : "-"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 6 }}>
        <div style={{ color: "black", opacity: 0.7 }}>Target</div>
        <div style={{ fontWeight: 900, color: "black" }}>
          {target !== null ? `${target.toFixed(1)}%` : "-"}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 6 }}>
        <div style={{ color: "black", opacity: 0.7 }}>Gap</div>
        <div style={{ fontWeight: 900, color: "black" }}>
          {gap !== null ? `${gap.toFixed(1)}%` : "-"}
        </div>
      </div>
    </div>
  );
}

function InsideBarValueLabel(props: any) {
  const { x, y, width, height, payload } = props;
  const item = payload as YearTotalItem;
  if (!item) return null;

  const cx = x + width / 2;
  const yMid = y + height / 2;

  if (!item.hasData) {
    // "Not" / "Started" di dekat bawah chart (di dalam area bar kosong)
    const t1 = "Not";
    const t2 = "Started";

    return (
      <>
        <text
          x={cx}
          y={y + height - 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={10}
          fontWeight={800}
        >
          {t1}
        </text>
        <text
          x={cx}
          y={y + height - 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={10}
          fontWeight={800}
        >
          {t2}
        </text>
      </>
    );
  }

  const val = Number(item.value);
  if (!Number.isFinite(val)) return null;

  return (
    <text
      x={cx}
      y={yMid + 4}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="rgba(255,255,255,0.92)"
      fontSize={10}
      fontWeight={800}
    >
      {`${val.toFixed(2)}%`}
    </text>
  );
}

function TargetLabel(props: any) {
  const { x, y, value } = props;
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

export function YearTotalBarChart({
  title = "Total per Tahun",
  data,
  metric = "oee",
  years,
  yearRange,
  mode = "avg",
  ignoreZero = true,
  theme,
  yDomain = [0, 100],
  ketYTD = "",
}: Props) {
  // theme (mirip RN dark)
  const barStart = theme?.barStart ?? "#1581BF";
  const barEnd = theme?.barEnd ?? "#1581BF33";
  const targetLineColor = theme?.targetLineDark ?? "#fffb00ff";
  const axisLineColor = theme?.axisLineDark ?? "#71717a";
  const labelColor = theme?.labelDark ?? "white";

  const yearsToShow = useMemo(() => {
    if (years?.length) return [...years].sort((a, b) => a - b);

    if (yearRange?.length === 2) {
      const [a, b] = yearRange;
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    return Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b);
  }, [years, yearRange, data]);

  const yearTotals: YearTotalItem[] = useMemo(() => {
    const targetKey = metric === "oee" ? "tgt_oee" : "tgt_cu";

    return yearsToShow.map((y) => {
      const rows = data.filter((d) => d.year === y);

      const vals = rows
        .map((d) => (d as any)[metric])
        .map((v) => (v === null || v === undefined ? NaN : Number(v)))
        .filter((v) => Number.isFinite(v) && (!ignoreZero || v > 0));

      const tgt =
        rows
          .map((d) => (d as any)[targetKey])
          .map((v) => (v === null || v === undefined ? NaN : Number(v)))
          .filter((v) => Number.isFinite(v))
          .pop() ?? null;

      if (vals.length === 0) {
        return { year: y, yearLabel: String(y), value: 0, hasData: false, target: tgt };
      }

      const total = vals.reduce((a, b) => a + b, 0);
      const value = mode === "sum" ? total : total / vals.length;

      return { year: y, yearLabel: String(y), value, hasData: true, target: tgt };
    });
  }, [data, yearsToShow, metric, mode, ignoreZero]);

  if (yearTotals.length === 0) {
    return (
      <div
        className="rounded-2xl border p-3"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="text-white/70">No data available</div>
      </div>
    );
  }

  const gradientId = `grad_ytd_${metric}`;

  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="font-bold text-white">{title}</div>

      <div className="relative mt-2" style={{ height: 267 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={yearTotals} margin={{ top: 22, right: 18, left: 10, bottom: 18 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={barStart} stopOpacity={1} />
                <stop offset="100%" stopColor={barEnd} stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="yearLabel"
              tick={{ fill: labelColor, opacity: 0.85, fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: axisLineColor, opacity: 0.5 }}
              tickLine={{ stroke: axisLineColor, opacity: 0.35 }}
            />

            <YAxis
              domain={[yDomain[0], yDomain[1]]}
              tick={{ fill: labelColor, opacity: 0.7, fontSize: 10, fontWeight: 700 }}
              axisLine={{ stroke: axisLineColor, opacity: 0.5 }}
              tickLine={{ stroke: axisLineColor, opacity: 0.35 }}
              width={36}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={<TooltipCard />}
              wrapperStyle={{ outline: "none" }}
            />

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

            <Bar
              dataKey="value"
              name="actual"
              fill={`url(#${gradientId})`}
              radius={[10, 10, 0, 0]}
              maxBarSize={52}
              isAnimationActive
              animationDuration={700}
            >
              {/* label selalu tampil */}
              <LabelList dataKey="value" content={<InsideBarValueLabel />} />
            </Bar>

            {/* target line dashed + dot + label */}
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
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[10px] mt-2" style={{ color: labelColor, opacity: 0.7 }}>
        {ketYTD}
      </div>
    </div>
  );
}
