import { apiGet } from "./api";
import type { YtdLatestResponse } from "../types/ytd";

export async function getYtdLatest(plant: string) {
  if (!plant) throw new Error("plant is required");

  return apiGet<YtdLatestResponse>(
    `/api/ytd_latest?plant=${encodeURIComponent(plant)}`
  );
}
