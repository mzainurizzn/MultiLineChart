import React from "react";

export type Plant = {
  id: string;
  name: string;
};

type Props = {
  plant: Plant;
  onClick: () => void;
};

export default function PlantCard({ plant, onClick }: Props) {
  const cardBg = "#0f1b2d";
  const primary = "#1581BF";
  const subtle = "#ffffffb3";

  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      className="w-full text-left"
      style={{marginBottom:10}}
    >
      <div
        className="rounded-2xl border p-4 transition"
        style={{
          background: cardBg,
          borderColor: pressed ? `${primary}66` : "#ffffff14",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white text-base font-extrabold">
              {plant.name}
            </div>
            <div className="mt-1 text-xs" style={{ color: subtle }}>
              Tap to view detail
            </div>
          </div>

          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              background: `${primary}22`,
              borderColor: `${primary}44`,
            }}
          >
            <span className="text-lg font-extrabold" style={{ color: primary }}>
              ›
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
