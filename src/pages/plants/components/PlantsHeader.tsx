type Props = {
  count: number;
  isLandscape: boolean;
};

export default function PlantsHeader({ count, isLandscape }: Props) {
  const pageBg = "#0b1220";
  const cardBg = "#0f1b2d";
  const subtle = "#ffffffb3";

  // mirip logic headerW kamu
  const headerStyle: React.CSSProperties = isLandscape
    ? { width: Math.min(380, Math.max(280, window.innerWidth * 0.32)) }
    : { width: "100%" };

  return (
    <div style={{ background: pageBg, marginBottom:10 }}>
      <div
        className="rounded-2xl border border-white/10 p-4"
        style={{ background: cardBg, ...headerStyle, width:"100%"}}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white text-xl font-extrabold">Plants</div>
            <div className="mt-1 text-sm" style={{ color: subtle }}>
              {count} plants available
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2">
            <div className="text-white text-xs font-extrabold">LIST</div>
          </div>
        </div>

        <div className="mt-4 h-px bg-white/10" />

        <div className="mt-3 text-xs" style={{ color: subtle }}>
          Tap salah satu plant untuk melihat grafik OEE &amp; CU per tahun.
        </div>
      </div>
    </div>
  );
}
