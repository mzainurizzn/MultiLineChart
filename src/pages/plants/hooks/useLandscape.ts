import { useEffect, useState } from "react";

export function useLandscape() {
  const [state, setState] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () =>
      setState({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLandscape = state.width > state.height;
  return { ...state, isLandscape };
}
