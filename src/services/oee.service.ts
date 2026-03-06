import { apiGet } from "./api";
import type { OeeApiResponse, OeeMonthly, PlantOeeResult } from "../types/oee";

const MONTH_MAP: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const MONTH_LABEL = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getPlantOee(plant: string): Promise<PlantOeeResult> {
    const url = `/api/oee?plant=${encodeURIComponent(plant)}`; // ✅ wajib encode
    const res = await apiGet<OeeApiResponse>(url);
    console.log("Res: ",res)

  if (!res?.success || !Array.isArray(res.data)) {
    return { series: [], ket: null };
  }

  const series: OeeMonthly[] = res.data
    .map((item) => {
      const parts = String(item.month_period ?? "").split(" ");
      if (parts.length < 2) return null;

      const monthName = parts[0];
      const yy = parts[1];

      const month = MONTH_MAP[monthName];
      const year = 2000 + Number(yy);

      if (!month || !Number.isFinite(year)) return null;

      return {
        year,
        month,
        label: MONTH_LABEL[month],
        oee: Number(item.oee_pct) || 0,
        cu: Number(item.cu_pct) || 0,
        oeeTgt: Number(item.oee_tgt) || 0,
        cuTgt: Number(item.cu_tgt) || 0,
      };
    })
    .filter((x): x is OeeMonthly => Boolean(x));

  series.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  // ket untuk plant (fallback kalau tidak ketemu)
  const ket = (res.ket ?? []).find((k) => k.plant === plant) ?? (res.ket?.[0] ?? null);

  return { series, ket };
}
