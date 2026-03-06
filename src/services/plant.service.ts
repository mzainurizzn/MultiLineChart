import { apiGet } from "./api";
import type { PlantApiResponse, Plant } from "../types/plants";

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function getPlants(): Promise<Plant[]> {
  const res = await apiGet<PlantApiResponse>("/api/plants");

  // optional debug
//   console.log("plants:", res);

  return res.plants
    .filter((p) => p && p !== "-")
    .map((name) => ({ id: slugify(name), name }));
}
