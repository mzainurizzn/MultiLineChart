import PlantCard, { Plant } from "./PlantCard";

type Props = {
  data: Plant[];
  isLandscape: boolean;
  onSelect: (id: string) => void;
};

export default function PlantsGrid({ data, isLandscape, onSelect }: Props) {
  // di RN: landscape 2 kolom, portrait 1 kolom
  const cols = isLandscape ? 2 : 1;

  return (
    <div
      className="w-full"
      style={{
        // display: "grid",
        // marginBottom:10,
        gap: 12,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {data.map((p) => (
        <PlantCard key={p.id} plant={p} onClick={() => onSelect(p.id)}/>
      ))}
      <div className="h-6" />
    </div>
  );
}
