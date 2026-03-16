import { useEffect, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setSize({
        width: Math.floor(cr.width),
        height: Math.floor(cr.height),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);

  const isLandscape = size.width > size.height;

  return {
    ref: setEl,
    ...size,
    isLandscape,
  };
}