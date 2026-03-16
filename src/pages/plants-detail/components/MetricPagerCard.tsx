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
  yearly1?: React.ReactNode | null;
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
  yearly1,
}: Props) {
  const { ref: cardRef, width: cardW } = useElementSize<HTMLDivElement>();
  const pagerW = Math.max(280, cardW || 0);

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  // total pages: landscape => [monthly, yearly] = 2
  // portrait => [monthly1, monthly2, yearly] = 3 (monthly2 optional, but in your logic you show 3 dots)
  const pages = [monthly1, monthly2, yearly, yearly1].filter(Boolean);
  const pageCount = pages.length;

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
        </div>

        <div className="mt-2 text-white/60 text-xs">
          Swipe kiri/kanan untuk pindah view Mesin lain
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
              {pages.map((content, i) => (
                <div
                  key={i}
                  className="h-full"
                  style={{ width: pagerW, scrollSnapAlign: "start" }}
                >
                  <div className="p-3">{content}</div>
                </div>
              ))}
            </div>

            {/* page 0 */}
            <div className="h-full" style={{ width: pagerW, scrollSnapAlign: "start" as any }}>
              <div className="p-3">{monthly1}</div>
            </div>

            {/* page 1 */}
            <div className="h-full" style={{ width: pagerW, scrollSnapAlign: "start" as any }}>
              <div className="p-3">
                {monthly2 ? monthly2 : <div className="text-white/70">—</div>}
              </div>
            </div>

            {/* page 2 */}
            <div className="h-full" style={{ width: pagerW, scrollSnapAlign: "start" as any }}>
              <div className="p-3">{yearly}</div>
            </div>

            {/* page 3 */}
            <div className="h-full" style={{ width: pagerW, scrollSnapAlign: "start" as any }}>
              <div className="p-3">
                {yearly1 ? yearly1 : <div className="text-white/70">—</div>}
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
