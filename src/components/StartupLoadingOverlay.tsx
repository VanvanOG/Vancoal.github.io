import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  forceCompleteBootPreload,
  getBootPreloadState,
  startBootPreload,
  subscribeBootPreload,
  type BootPreloadState,
} from "../utils/preloadManager";
import { publicPath } from "../utils/publicPath";

export default function StartupLoadingOverlay() {
  const [preloadState, setPreloadState] = useState<BootPreloadState>(() => getBootPreloadState());
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const mountedAtRef = useRef(0);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const loadingGif = publicPath("/media/loading/loading-loop-matched.gif");
  const completeIcon = publicPath("/media/loading/complete-icon.svg");
  const pendingIcon = publicPath("/media/loading/pending-icon-v3.svg");

  useEffect(() => {
    if (isHidden) {
      return undefined;
    }

    mountedAtRef.current = performance.now();
    document.documentElement.classList.add("is-startup-loading");

    const unsubscribe = subscribeBootPreload(setPreloadState);
    const startTimer = window.setTimeout(() => {
      void startBootPreload();
    }, reducedMotion ? 0 : 140);
    const failSafeTimer = window.setTimeout(() => {
      forceCompleteBootPreload();
    }, reducedMotion ? 6000 : 30000);

    return () => {
      unsubscribe();
      window.clearTimeout(startTimer);
      window.clearTimeout(failSafeTimer);
      document.documentElement.classList.remove("is-startup-loading");
    };
  }, [isHidden, reducedMotion]);

  useEffect(() => {
    if (!preloadState.isDone || isExiting || isHidden) {
      return undefined;
    }

    const minVisibleMs = reducedMotion ? 320 : 900;
    const exitDuration = reducedMotion ? 180 : 520;
    const elapsed = performance.now() - mountedAtRef.current;
    const startExitDelay = Math.max(minVisibleMs - elapsed, 0);
    let hideTimer = 0;

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
      document.documentElement.classList.remove("is-startup-loading");
      hideTimer = window.setTimeout(() => {
        setIsHidden(true);
      }, exitDuration);
    }, startExitDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isExiting, isHidden, preloadState.isDone, reducedMotion]);

  if (isHidden) {
    return null;
  }

  const activeIndex =
    preloadState.isDone
      ? preloadState.items.length - 1
      : preloadState.items.findIndex((item) => item.status !== "complete");
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : preloadState.items.length - 1;
  const itemListStyle = { "--active-index": safeActiveIndex } as CSSProperties;
  const progress = Math.max(0, Math.min(preloadState.progress, 100));

  return (
    <div className={`startup-loading${isExiting ? " is-exiting" : ""}`} role="status" aria-live="polite">
      <div className="startup-loading-stage">
        <img className="startup-loading-gif" src={loadingGif} alt="" aria-hidden="true" />
        <div className="startup-loading-items" style={itemListStyle}>
          <div className="startup-loading-list">
            {preloadState.items.map((item, index) => {
              const isComplete = item.status === "complete";
              const isActive = index === safeActiveIndex && !isComplete;

              return (
                <div
                  className={`startup-loading-item${isComplete ? " is-complete" : ""}${isActive ? " is-active" : ""}`}
                  key={item.id}
                >
                  <img
                    src={isComplete ? completeIcon : pendingIcon}
                    alt=""
                    aria-hidden="true"
                    className="startup-loading-item-icon"
                  />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="startup-loading-bottom" aria-label={`Loading ${progress}%`}>
        <strong>{progress}%</strong>
      </div>
    </div>
  );
}
