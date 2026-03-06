import React from "react";
import PagerDots from "./PagerDots";
import { useElementSize } from "../hooks/useElementSize";

type Props = {
  title: string;
  isLandscape: boolean;
  primary: string;
  pageBg: string;
  cardBg: string;
  border: string;

  page: number;
  setPage: (n: number) => void;

  height?: number;

  monthly1: React.ReactNode;
  monthly2?: React.ReactNode | null;
  yearly: React.ReactNode;
};

export default function MetricPagerCard({
  title,
  isLandscape,
  primary,
  pageBg,
  cardBg,
  border,
  page,
  setPage,
  height = 450,
  monthly1,
  monthly2,
  yearly,
}: Props) {
  const { ref: cardRef, width: cardW } = useElementSize<HTMLDivElement>();
  const pagerW = Math.max(280, cardW || 0);

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  // total pages: landscape => [monthly, yearly] = 2
  // portrait => [monthly1, monthly2, yearly] = 3 (monthly2 optional, but in your logic you show 3 dots)
  const pageCount = isLandscape ? 2 : 3;

  // label logic (copy dari RN)
  let label = "Bulanan";
  if (isLandscape) {
    label = page === 0 ? "Bulanan" : "Tahunan";
  } else {
    label = page === 0 || page === 1 ? "Bulanan" : "Tahunan";
  }

  // restore scroll position kalau width berubah / rotate
  React.useEffect(() => {
    if (!pagerW) return;
    scrollerRef.current?.scrollTo({ left: page * pagerW, behavior: "instant" as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagerW, isLandscape]);

  const onScrollEnd = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / pagerW);
    setPage(Math.max(0, Math.min(pageCount - 1, idx)));
  };

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border overflow-hidden"
      style={{ background: cardBg, borderColor: border }}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white font-extrabold text-base">{title}</div>

          <div
            className="rounded-xl border px-3 py-2"
            style={{ borderColor: border, background: "#ffffff0f" }}
          >
            <div className="text-white/85 text-xs font-extrabold">{label}</div>
          </div>
        </div>

        <div className="mt-2 text-white/60 text-xs">
          Swipe kiri/kanan untuk pindah view
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Body */}
      <div style={{ height }}>
        {!pagerW ? (
          <div className="p-4 text-white/70">Measuring layout…</div>
        ) : (
          <div
            ref={scrollerRef}
            className="h-full overflow-x-auto overflow-y-hidden"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
            onScroll={() => {
              // debounce ringan: tunggu user berhenti
              window.clearTimeout((onScrollEnd as any)._t);
              (onScrollEnd as any)._t = window.setTimeout(onScrollEnd, 120);
            }}
          >
            <div className="h-full flex" style={{ width: pagerW * pageCount }}>
              {/* page 0 */}
              <div
                className="h-full"
                style={{ width: pagerW, scrollSnapAlign: "start" as any }}
              >
                <div className="p-3">{monthly1}</div>
              </div>

              {/* page 1 (monthly2) */}
              <div
                className="h-full"
                style={{ width: pagerW, scrollSnapAlign: "start" as any }}
              >
                <div className="p-3">
                  {monthly2 ? monthly2 : <div className="text-white/70">—</div>}
                </div>
              </div>

              {/* page 2 (yearly) */}
              <div
                className="h-full"
                style={{ width: pagerW, scrollSnapAlign: "start" as any }}
              >
                <div className="p-3">{yearly}</div>
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-white/10" />
        <PagerDots count={pageCount} index={page} primary={primary} />
      </div>
    </div>
  );
}
