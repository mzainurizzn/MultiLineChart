import { useEffect, useState } from "react";
import type { Plant } from "../types/plants";
import { getPlants } from "../services/plant.service";

export function usePlants() {
  const [data, setData] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    getPlants()
      .then((plants) => {
        if (!alive) return;
        setData(plants);
        setError(null);
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
  }, []);

  return { data, loading, error };
}
