import React from "react";
import { useMemo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { usePlants } from "../../hooks/usePlants";
import { usePlantOee } from "../../hooks/usePlantOee";
import { useYtdLatest } from "../../hooks/useYtdLatest";

import { useLandscape } from "../plants/hooks/useLandscape"; // atau path hook kamu
import MetricPagerCard from "./components/MetricPagerCard";
import YearPickerModal from "./components/YearPickerModal";

// chart kamu (web)
import { BarChart } from "../plants-detail/components/BarChart";
import { YearTotalBarChart } from "./components/YearTotalBarChart";

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const slug = String(id ?? "");

  // theme (samakan dengan Plants)
  const pageBg = "#0b1220";
  const cardBg = "#0f1b2d";
  const border = "#ffffff14";
  const primary = "#1581BF";

  const { isLandscape } = useLandscape();

  // =========================
  // Data sources
  // =========================
  const { data: plants, loading: plantsLoading, error: plantsError } = usePlants();
  const plantName = useMemo(
    () => plants.find((p) => p.id === slug)?.name ?? slug,
    [plants, slug]
  );

  const { data, loading, error, ket } = usePlantOee(plantName);
  const { data: ytdSeries, years: ytdYears, loading: ytdLoading } = useYtdLatest(plantName);

  console.log("ytd series:", ytdSeries)
  console.log("ytd years:", ytdYears)

  const ket_plant = ket?.ket_plant;
  const ket_ytd_cu = ket?.ket_cu;
  const ket_ytd_oee = ket?.ket_oee;
  const ket_mounth_cu = ket?.ket_cu;
  const ket_mounth_oee = ket?.ket_oee;

  // =========================
  // Derived: years / selectedYear / yearData
  // =========================
  const years = useMemo(
    () => Array.from(new Set((data ?? []).map((d: any) => d.year))).sort((a, b) => b - a),
    [data]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    if (years.length > 0 && selectedYear === null) setSelectedYear(years[0]);
  }, [years, selectedYear]);

  const yearData = useMemo(() => {
    return (data ?? [])
      .filter((d: any) => d.year === selectedYear)
      .sort((a: any, b: any) => a.month - b.month);
  }, [data, selectedYear]);

  const yearData1 = useMemo(() => yearData.filter((d: any) => d.month >= 1 && d.month <= 6), [yearData]);
  const yearData2 = useMemo(() => yearData.filter((d: any) => d.month >= 7 && d.month <= 12), [yearData]);

  console.log("data",yearData)

  // =========================
  // Layout sizing (mirip RN)
  // =========================
  const PAGER_H = isLandscape ? 410 : 425;

  // =========================
  // Pager state
  // =========================
  const [oeePage, setOeePage] = useState(0);
  const [cuPage, setCuPage] = useState(0);

  useEffect(() => {
    // reset pager ketika ganti plant
    setOeePage(0);
    setCuPage(0);
  }, [slug]);

  // =========================
  // Loading / Error
  // =========================
  if (loading || plantsLoading || ytdLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6" style={{ background: pageBg }}>
        <div className="rounded-2xl border p-4" style={{ background: cardBg, borderColor: border }}>
          <div className="text-white font-extrabold text-base">Loading data…</div>
          <div className="text-white/70 mt-2 text-sm">Mengambil OEE/CU dari server</div>
        </div>
      </div>
    );
  }

  if (error || plantsError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6" style={{ background: pageBg }}>
        <div className="rounded-2xl border p-4" style={{ background: "#ff00000f", borderColor: "#ff000033" }}>
          <div className="text-red-300 font-extrabold text-base">Failed to load data</div>
          <div className="text-white/70 mt-2 text-sm">Cek koneksi atau endpoint API.</div>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="p-4 pb-20 overflow-y-auto" style={{ background: pageBg }}>
      {/* container: portrait dibatasi, landscape full */}
      <div className="w-full mx-auto space-y-4" style={{ maxWidth: isLandscape ? "100%" : 1100 }}>
        {/* Header */}
        <div
          className="rounded-2xl border p-4 mx-auto"
          style={{
            background: cardBg,
            borderColor: border,
            width: isLandscape ? 600 : "100%",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-white text-xl font-extrabold">{plantName}</div>
              <div className="text-white/65 mt-1">Dashboard OEE &amp; CU</div>
            </div>

            <button
              type="button"
              onClick={() => setYearOpen(true)}
              className="rounded-xl px-4 py-2 font-extrabold text-white"
              style={{ background: primary }}
            >
              {selectedYear ? String(selectedYear) : "Pilih tahun"}{" "}
              <span className="text-white/90">▾</span>
            </button>
          </div>

          <div className="mt-4 h-px bg-white/10" />

          <div className="mt-4 flex flex-wrap gap-3">
            <div>
              <div className="text-white/60 text-xs">Tahun tersedia</div>
              <div className="text-white font-extrabold">
                {years.length > 0 ? years.join(", ") : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tahun */}
        <YearPickerModal
          open={yearOpen}
          onClose={() => setYearOpen(false)}
          years={years}
          selectedYear={selectedYear}
          onSelect={setSelectedYear}
          pageBg={pageBg}
          cardBg={cardBg}
          border={border}
          primary={primary}
        />

        {/* Charts */}
        {isLandscape ? (
          <div className="mx-auto space-y-4" style={{ width: 600 }}>
            <MetricPagerCard
              title="Overall Equipment Effectiveness"
              isLandscape={true}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={oeePage}
              setPage={setOeePage}
              height={PAGER_H}
              monthly1={
                selectedYear && yearData.length > 0 ? (
                //   
                <></>
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              monthly2={null /* landscape gak butuh monthly2 */}
              yearly={
                <YearTotalBarChart
                  title="YTD OEE (%)"
                  data={ytdSeries as any}
                  metric="oee"
                  mode="avg"
                  ignoreZero
                  years={ytdYears}
                  yDomain={[10, 100]}
                  theme={{
                    barStart: "#22c55e",
                    barEnd: "#22c55e33",
                    labelDark: "white",
                    labelLight: "black",
                  }}
                  ketYTD={ket_ytd_oee}
                />
              }
            />

            <MetricPagerCard
              title="Capacity Utilization"
              isLandscape={true}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={cuPage}
              setPage={setCuPage}
              height={PAGER_H}
              monthly1={
                selectedYear && yearData.length > 0 ? (
                  <BarChart
                    data={yearData}
                    metric="cu"
                    title={`CU (%) vs CU maks (${selectedYear})`}
                    theme={{
                      primary,
                      barStart: primary,
                      barEnd: `${primary}33`,
                      targetLine: "#ff4d4f",
                      targetLineDark: "#ffffff",
                    }}
                    targetLabelPos="right"
                    targetLabelOffsetY={-5}
                    yDomain={[0, 100]}
                    ketPlant={ket_plant}
                    ketKpi={ket_mounth_cu}
                  />
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              monthly2={null}
              yearly={
                <YearTotalBarChart
                  title="CYTD CU (%)"
                  data={ytdSeries as any}
                  metric="cu"
                  mode="avg"
                  ignoreZero
                  years={ytdYears}
                  yDomain={[10, 100]}
                  theme={{
                    barStart: primary,
                    barEnd: `${primary}33`,
                    labelDark: "white",
                    labelLight: "black",
                  }}
                  ketYTD={ket_ytd_cu}
                />
              }
            />
          </div>
        ) : (
          <div className="space-y-5">
            <MetricPagerCard
              title="Overall Equipment Effectiveness"
              isLandscape={false}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={oeePage}
              setPage={setOeePage}
              height={PAGER_H}
              monthly1={
                selectedYear && yearData.length > 0 ? (
                  <BarChart
                    data={yearData1}
                    metric="oee"
                    title={`OEE (%) vs Target (${selectedYear})`}
                    theme={{
                      primary,
                      barStart: "#22c55e",
                      barEnd: "#22c55e33",
                      targetLine: "#ff0004ff",
                      targetLineDark: "#ffffff",
                    }}
                    targetLabelPos="right"
                    targetLabelOffsetX={-5}
                    yDomain={[0, 100]}
                    ketKpi={ket_mounth_oee}
                  />
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              monthly2={
                selectedYear && yearData.length > 0 ? (
                  <BarChart
                    data={yearData2}
                    metric="oee"
                    title={`OEE (%) vs Target (${selectedYear})`}
                    theme={{
                      primary,
                      barStart: "#22c55e",
                      barEnd: "#22c55e33",
                      targetLine: "#ff0004ff",
                      targetLineDark: "#ffffff",
                    }}
                    targetLabelPos="right"
                    targetLabelOffsetX={-5}
                    yDomain={[0, 100]}
                    ketKpi={ket_mounth_oee}
                  />
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              yearly={
                <YearTotalBarChart
                  title="YTD OEE (%)"
                  data={ytdSeries as any}
                  metric="oee"
                  mode="avg"
                  ignoreZero
                  years={ytdYears}
                  yDomain={[10, 100]}
                  theme={{
                    barStart: "#22c55e",
                    barEnd: "#22c55e33",
                    labelDark: "white",
                    labelLight: "black",
                  }}
                  ketYTD={ket_ytd_oee}
                />
              }
            />

            <MetricPagerCard
              title="Capacity Utilization"
              isLandscape={false}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={cuPage}
              setPage={setCuPage}
              height={PAGER_H}
              monthly1={
                selectedYear && yearData.length > 0 ? (
                  <BarChart
                    data={yearData1}
                    metric="cu"
                    title={`CU (%) vs CU maks (${selectedYear})`}
                    theme={{
                      primary,
                      barStart: primary,
                      barEnd: `${primary}33`,
                      targetLine: "#ff4d4f",
                      targetLineDark: "#ffffff",
                    }}
                    targetLabelPos="right"
                    targetLabelOffsetY={-5}
                    yDomain={[0, 100]}
                    ketPlant={ket_plant}
                    ketKpi={ket_mounth_cu}
                  />
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              monthly2={
                selectedYear && yearData.length > 0 ? (
                  <BarChart
                    data={yearData2}
                    metric="cu"
                    title={`CU (%) vs CU maks (${selectedYear})`}
                    theme={{
                      primary,
                      barStart: primary,
                      barEnd: `${primary}33`,
                      targetLine: "#ff4d4f",
                      targetLineDark: "#ffffff",
                    }}
                    targetLabelPos="right"
                    targetLabelOffsetY={-5}
                    yDomain={[0, 100]}
                    ketPlant={ket_plant}
                    ketKpi={ket_mounth_cu}
                  />
                ) : (
                  <div className="p-4 text-white font-extrabold">No data available</div>
                )
              }
              yearly={
                <YearTotalBarChart
                  title="YTD CU (%)"
                  data={ytdSeries as any}
                  metric="cu"
                  mode="avg"
                  ignoreZero
                  years={ytdYears}
                  yDomain={[10, 100]}
                  theme={{
                    barStart: primary,
                    barEnd: `${primary}33`,
                    labelDark: "white",
                    labelLight: "black",
                  }}
                  ketYTD={ket_ytd_cu}
                />
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
