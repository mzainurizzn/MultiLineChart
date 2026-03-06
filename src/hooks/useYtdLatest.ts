import { useEffect, useState } from "react";
import { getYtdLatest } from "../services/ytd.service";
import type { YearlyChartRow } from "../types/ytd";

export function useYtdLatest(plant: string) {
  const [data, setData] = useState<YearlyChartRow[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!plant) return;

    let alive = true;
    setLoading(true);
    setError(null);

    getYtdLatest(plant)
      .then((rows) => {
        if (!alive) return;

        const item =
          rows.find((r) => (r.plant ?? "").trim() === plant.trim()) ?? rows[0];

        const out: YearlyChartRow[] = (item?.data ?? [])
          .map((d) => ({
            year: Number(d.tahun),
            oee: d.ytd_oee,
            cu: d.ytd_cu,
            tgt_oee: d.tgt_ytd_oee ?? null,
            tgt_cu: d.tgt_ytd_cu ?? null,
          }))
          .filter((x) => Number.isFinite(x.year))
          .sort((a, b) => a.year - b.year);

        setData(out);
        setYears(out.map((x) => x.year));
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setData([]);
        setYears([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [plant]);

  return { data, years, loading, error };
}
