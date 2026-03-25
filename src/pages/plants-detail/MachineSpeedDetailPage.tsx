import React from "react";
import { useMemo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

//import { usePlants } from "../../hooks/usePlants";
//import { usePlantOee } from "../../hooks/usePlantOee";
//import { useYtdLatest } from "../../hooks/useYtdLatest";
import { useElementSize } from "./hooks/useElementSize";
import MetricPagerCard from "./components/MetricPagerCard";
import YearPickerModal from "./components/YearPickerModal";

import mqtt from "mqtt";

// chart kamu (web)
import { BarChart } from "./components/BarChart";
import { YearTotalBarChart } from "./components/YearTotalBarChart";
import { HeaderCard2 } from "./components/HeaderCard2";

// coba line chart 
import RealtimeMqttLineChart from "../plants/components/RealtimeMqttLineChart";
import RealtimeMqttLineChart1 from "../plants/components/RealtimeMqttLineChart1";

import { useMqttOutputs } from "./hooks/useMqttOutputs";


export default function MachineSpeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const slug = String(id ?? "");

  

  // theme (samakan dengan Plants)
  const pageBg = "#0b1220";
  const cardBg = "#0f1b2d";
  const border = "#ffffff14";
  const primary = "#1581BF";

  const { isLandscape } = useElementSize();

  // =========================
  // Data sources
  // =========================
  //const { data: plants, loading: plantsLoading, error: plantsError } = usePlants();
  //const plantName = useMemo(
    //() => plants.find((p) => p.id === slug)?.name ?? slug,
    //[plants, slug]
  //);

  //const { data, loading, error, ket } = usePlantOee(plantName);
  //const { data: ytdSeries, years: ytdYears, loading: ytdLoading } = useYtdLatest(plantName);

  ;

  const { napkinCurrent, napkinLast, pantsCurrent, pantsLast,Line1 ,Line3 ,Line4 ,Line5, Line6, Line7, Line8, Line9, Line10, Line11 } = useMqttOutputs();
  

  // =========================
  // Derived: years / selectedYear / yearData
  // =========================
  //const years = useMemo(
   // () => Array.from(new Set((data ?? []).map((d: any) => d.year))).sort((a, b) => b - a),
    //[data]
  //);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearOpen, setYearOpen] = useState(false);

  //useEffect(() => {
    //if (years.length > 0 && selectedYear === null) setSelectedYear(years[0]);
  //}, [years, selectedYear]);

  //const yearData = useMemo(() => {
    //return (data ?? [])
     // .filter((d: any) => d.year === selectedYear)
      //.sort((a: any, b: any) => a.month - b.month);
  //}, [data, selectedYear]);

  //const yearData1 = useMemo(() => yearData.filter((d: any) => d.month >= 1 && d.month <= 6), [yearData]);
  //const yearData2 = useMemo(() => yearData.filter((d: any) => d.month >= 7 && d.month <= 12), [yearData]);

  //console.log("data",yearData)

  // =========================
  // Layout sizing (mirip RN)
  // =========================
  const PAGER_H = isLandscape ? 500 : 480;

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
  //if (loading || plantsLoading || ytdLoading) {
    //return (
      //<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6" style={{ background: pageBg }}>
       // <div className="rounded-2xl border p-4" style={{ background: cardBg, borderColor: border }}>
         // <div className="text-white font-extrabold text-base">Loading data…</div>
          //<div className="text-white/70 mt-2 text-sm">Mengambil Data dari server</div>
       // </div>
      //</div>
   // );
 // }

  //if (error || plantsError) {
    //return (
      //<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6" style={{ background: pageBg }}>
       // <div className="rounded-2xl border p-4" style={{ background: "#ff00000f", borderColor: "#ff000033" }}>
         // <div className="text-red-300 font-extrabold text-base">Failed to load data</div>
          //<div className="text-white/70 mt-2 text-sm">Cek koneksi atau endpoint API.</div>
        //</div>
      //</div>
    //);
  //}

  // =========================
  // UI
  // =========================
  return (
    <div className="relative min-h-screen p-4 pb-20 overflow-y-auto" style={{ background: pageBg }}>
      {/* container: portrait dibatasi, landscape full */}
      <div className="w-full mx-auto space-y-4" style={{ maxWidth: isLandscape ? "100%" : 1100 }}>
        {/* Header 1 */}
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
              <div className="text-white text-xl font-extrabold">PT.Aneka Mitra Gemilang</div>
              <div className="text-white/65 mt-1">Machine Speed &amp; Performance Monitoring</div>
            </div>

            <button
              type="button"
              // sementara fungsi di-off kan karena halaman belum ada
              onClick={() => {}}
              disabled
              className="rounded-xl px-4 py-2 font-extrabold text-white opacity-50 cursor-not-allowed"
              style={{ background: primary }}
            >
              Detail Daily <span className="text-white/90"></span>
            </button>
          </div>

          <div className="mt-4 h-px bg-white/10" />

          <div className="mt-4 flex flex-wrap gap-4">

          <div className="bg-[#0b1626] border border-white/10 rounded-xl px-4 py-3 w-full sm:w-[150px] flex-1">
            <div className="text-white/60 text-xs">Current Output Napkin</div>
            <div className="text-white font-extrabold text-lg">{napkinCurrent.toLocaleString("id-ID")}</div>
          </div>

          <div className="bg-[#0b1626] border border-white/10 rounded-xl px-4 py-3 w-full sm:w-[150px] flex-1">
            <div className="text-white/60 text-xs">Last Day Output Napkin</div>
            <div className="text-white font-extrabold text-lg">{napkinLast.toLocaleString("id-ID")}</div>
          </div>

          <div className="bg-[#0b1626] border border-white/10 rounded-xl px-4 py-3 w-full sm:w-[150px] flex-1">
            <div className="text-white/60 text-xs">Current Output Pants</div>
            <div className="text-white font-extrabold text-lg">{pantsCurrent.toLocaleString("id-ID")}</div>
          </div>

          <div className="bg-[#0b1626] border border-white/10 rounded-xl px-4 py-3 w-full sm:w-[150px] flex-1">
            <div className="text-white/60 text-xs">Last Day Output Pants</div>
            <div className="text-white font-extrabold text-lg">{pantsLast.toLocaleString("id-ID")}</div>
          </div>
        </div>
        </div>

        

      {/* Header 2 */}
      <div className="w-full mx-auto mt-4" style={{ maxWidth: isLandscape ? "100%" : 1100 }}>
    
        <HeaderCard2
          cardBg={cardBg}
          border={border}
          primary={primary}
          isLandscape={isLandscape}
          Line1={Line1}
          Line3={Line3}
          Line4={Line4}
          Line5={Line5}
          Line6={Line6}
          Line7={Line7}
          Line8={Line8}
          Line9={Line9}
          Line10={Line10}
          Line11={Line11}

          
        
        />
      </div>

        {/* Charts */}
        {isLandscape ? (
          <div className="mx-auto space-y-4" style={{ width: 600 }}>
            
            
          </div>
        ) : (
          <div className="space-y-5">
            <MetricPagerCard
              title="Sanitary Napkin Machine 1,6 dan 11"
              isLandscape={false}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={oeePage}
              setPage={setOeePage}
              height={PAGER_H}
              monthly1={
                 (
                  // <BarChart
                  //   data={yearData1}
                  //   metric="oee"
                  //   title={`OEE (%) vs Target (${selectedYear})`}
                  //   theme={{
                  //     primary,
                  //     barStart: "#22c55e",
                  //     barEnd: "#22c55e33",
                  //     targetLine: "#ff0004ff",
                  //     targetLineDark: "#ffffff",
                  //   }}
                  //   targetLabelPos="right"
                  //   targetLabelOffsetX={-5}
                  //   yDomain={[0, 100]}
                  //   ketKpi={ket_mounth_oee}
                  // />
                  <RealtimeMqttLineChart
                    title="Trend Speed Machine 1"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line1"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                )  
              }
              monthly2={
                 (
                  <RealtimeMqttLineChart
                    title="Trend Speed Machine 6"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line6"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                )
              }
              yearly={
                <RealtimeMqttLineChart
                    title="Trend Speed Machine 11"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line11"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
              }
            />

            <MetricPagerCard
              title="Baby Pants Machine 3,4 dan 5"
              isLandscape={false}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={oeePage}
              setPage={setOeePage}
              height={PAGER_H}
              monthly1={
                (
                  // <BarChart
                  //   data={yearData1}
                  //   metric="oee"
                  //   title={`OEE (%) vs Target (${selectedYear})`}
                  //   theme={{
                  //     primary,
                  //     barStart: "#22c55e",
                  //     barEnd: "#22c55e33",
                  //     targetLine: "#ff0004ff",
                  //     targetLineDark: "#ffffff",
                  //   }}
                  //   targetLabelPos="right"
                  //   targetLabelOffsetX={-5}
                  //   yDomain={[0, 100]}
                  //   ketKpi={ket_mounth_oee}
                  // />
                  <RealtimeMqttLineChart1
                    title="Trend Speed Machine 3"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line3"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                ) 
              }
              monthly2={
                 (
                  <RealtimeMqttLineChart1
                    title="Trend Speed Machine 4"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line4"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                ) 
              }
              yearly={
                <RealtimeMqttLineChart1
                    title="Trend Speed Machine 5"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line5"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
              }
            />

            <MetricPagerCard
              title="Baby Pants Machine 7,8,9 dan 10"
              isLandscape={false}
              primary={primary}
              pageBg={pageBg}
              cardBg={cardBg}
              border={border}
              page={oeePage}
              setPage={setOeePage}
              height={PAGER_H}
              monthly1={
                 (
                  // <BarChart
                  //   data={yearData1}
                  //   metric="oee"
                  //   title={`OEE (%) vs Target (${selectedYear})`}
                  //   theme={{
                  //     primary,
                  //     barStart: "#22c55e",
                  //     barEnd: "#22c55e33",
                  //     targetLine: "#ff0004ff",
                  //     targetLineDark: "#ffffff",
                  //   }}
                  //   targetLabelPos="right"
                  //   targetLabelOffsetX={-5}
                  //   yDomain={[0, 100]}
                  //   ketKpi={ket_mounth_oee}
                  // />
                  <RealtimeMqttLineChart1
                    title="Trend Speed Machine 7"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line7"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                ) 
              }
              monthly2={
                 (
                  <RealtimeMqttLineChart1
                    title="Trend Speed Machine 8"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line8"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                ) 
              }
              yearly={
                <RealtimeMqttLineChart1
                    title="Trend Speed Machine 9"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line9"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
                  
              }
              yearly1={
                <RealtimeMqttLineChart1
                    title="Trend Speed Machine 10"
                    brokerUrl="ws://172.17.173.164:443"
                    historyBaseUrl="http://172.17.173.164:1880"
                    topic="AMG/Speed/Line10"
                    // username="user"
                    // password="pass"
                    maxPoints={120}
                    windowMinutes={10}
                    height={320}
                    lineName="Speed"
                  />
              }   
            />
          </div>
       )}
      </div>
      {/* Footer */}
    <div className="absolute bottom-4 left-0 w-full text-center text-white/50 text-sm">
    © PT. Aneka Mitra Gemilang {new Date().getFullYear()}. All rights reserved.
  </div>
    </div>
  );
}
