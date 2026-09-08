import { useEffect, useRef, type RefObject } from "react";

export function readingOffset(nav: HTMLElement | null) {
  const navTop = nav ? parseFloat(getComputedStyle(nav).top) || 0 : 0;
  return navTop + (nav?.getBoundingClientRect().height || 0) + 24;
}

export default function MarsReadingProgress({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;
    let pending = 0;
    let disposed = false;
    const update = () => {
      pending = 0;
      if (disposed) return;
      const rect = root.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const range = Math.max(0, rect.height - window.innerHeight);
      const ratio = range > 0 ? Math.max(0, Math.min(1, (window.scrollY - top) / range)) : 1;
      bar.style.transform = `scaleX(${ratio})`;
      bar.setAttribute("aria-valuenow", String(Math.round(ratio * 1000) / 10));
    };
    const schedule = () => { if (!pending && !disposed) pending = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    root.addEventListener("load", schedule, true);
    document.fonts.ready.then(schedule);
    update();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.removeEventListener("load", schedule, true);
    };
  }, [rootRef]);
  return <div ref={barRef} className="mars-reading-progress" role="progressbar" aria-label="案例阅读进度"
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} />;
}
