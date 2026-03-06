import { useNavigate } from "react-router-dom";
import { usePlants } from "../../hooks/usePlants"; // pakai punyamu
import PlantsHeader from "./components/PlantsHeader";
import PlantsGrid from "./components/PlantsGrid";
import { useLandscape } from "./hooks/useLandscape";
import React from "react";
import { getPlants } from "../../services/plant.service";

export default function PlantsPage() {
  const { data, loading, error } = usePlants();
  React.useEffect(() => {
  getPlants().then(console.log).catch(console.error);
}, []);

  console.log(data)
  const nav = useNavigate();
  const { isLandscape } = useLandscape();

  const pageBg = "#0b1220";
  const cardBg = "#0f1b2d";
  const subtle = "#ffffffb3";

  if (loading) {
    return (
      <div
        className="min-h-[calc(100vh-3.5rem)] p-4 flex items-center justify-center"
        style={{ background: pageBg }}
      >
        <div
          className="rounded-2xl border border-white/10 p-4"
          style={{ background: cardBg }}
        >
          <div className="text-white font-extrabold text-base">
            Loading plants…
          </div>
          <div className="mt-2 text-sm" style={{ color: subtle }}>
            Mengambil daftar plant dari server
          </div>
        </div>
      </div>
    );
  }

  const onSelect = (id: string) => {
    nav(`/plants/${id}`);
  };

  return (
    <div className="p-3" style={{ background: pageBg }}>
      {isLandscape ? (
        <div className="">
          <PlantsHeader count={data.length} isLandscape={true} />
          <div className="">
            <PlantsGrid data={data} isLandscape={true} onSelect={onSelect} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <PlantsHeader count={data.length} isLandscape={false} />
          <PlantsGrid data={data} isLandscape={false} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}
