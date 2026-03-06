type Props = {
  open: boolean;
  onClose: () => void;
  years: number[];
  selectedYear: number | null;
  onSelect: (y: number) => void;
  pageBg: string;
  cardBg: string;
  border: string;
  primary: string;
};

export default function YearPickerModal({
  open,
  onClose,
  years,
  selectedYear,
  onSelect,
  pageBg,
  cardBg,
  border,
  primary,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
        aria-label="Close"
      />

      {/* sheet */}
      <div
        className="absolute left-1/2 top-1/2 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 shadow-xl"
        style={{ background: cardBg, borderColor: border }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-extrabold text-base">Pilih Tahun</div>
            <div className="text-white/70 text-xs mt-1">Pilih untuk mengubah grafik</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-3 py-2 text-white font-bold"
            style={{ borderColor: border, background: "#ffffff1a" }}
          >
            Tutup
          </button>
        </div>

        <div className="my-3 h-px bg-white/10" />

        <div className="max-h-[55vh] overflow-auto pr-1">
          <div className="space-y-2">
            {years.map((y) => {
              const active = y === selectedYear;
              return (
                <button
                  key={y}
                  type="button"
                  className="w-full text-left rounded-xl border p-3"
                  style={{
                    borderColor: border,
                    background: active ? `${primary}22` : pageBg,
                  }}
                  onClick={() => {
                    onSelect(y);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-white font-extrabold">{y}</div>
                    <div className="font-extrabold" style={{ color: active ? "#58d68d" : "#ffffff55" }}>
                      {active ? "✓" : "→"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
