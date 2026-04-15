import React from "react";
import { useElementSize } from "../hooks/useElementSize";

type Props = {
  title: string;
  isLandscape: boolean;
  primary: string;
  pageBg: string;
  cardBg: string;
  border: string;

  height?: number;

  monthly1: React.ReactNode;
  monthly2?: React.ReactNode | null;
  yearly: React.ReactNode;
  yearly1?: React.ReactNode | null;
};

export default function MetricPagerCard({
  title,
  isLandscape,
  primary,
  pageBg,
  cardBg,
  border,
  height = 450,
  monthly1,
  monthly2,
  yearly,
  yearly1,
}: Props) {
  const { ref: cardRef } = useElementSize<HTMLDivElement>();

  // 👉 pilih konten yang mau ditampilkan (bisa kamu ubah)
  const content = monthly1; 
  // alternatif:
  // const content = isLandscape ? yearly : monthly1;

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border overflow-hidden"
      style={{ background: cardBg, borderColor: border }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white font-extrabold text-base">
            {title}
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Body (NO SLIDER) */}
      <div style={{ height }}>
        <div className="p-3 h-full">
          {content}
        </div>
      </div>
    </div>
  );
}