type Props = {
  count: number;
  index: number;
  primary: string;
};

export default function PagerDots({ count, index, primary }: Props) {
  return (
    <div className="flex justify-center gap-2 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ background: i === index ? primary : "#ffffff33" }}
        />
      ))}
    </div>
  );
}
