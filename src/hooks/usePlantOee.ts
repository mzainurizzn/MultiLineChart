import { useEffect, useState } from "react";
import { getPlantOee } from "../services/oee.service";
import type { OeeMonthly, OeeKetItem } from "../types/oee";

export function usePlantOee(plant: string) {
  const [data, setData] = useState<OeeMonthly[]>([]);
  const [ket, setKet] = useState<OeeKetItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!plant) return;

    let alive = true;
    setLoading(true);
    setError(null);

    getPlantOee(plant)
      .then((res) => {
        if (!alive) return;
        setData(res.series);
        setKet(res.ket);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [plant]);

  return { data, ket, loading, error };
}
