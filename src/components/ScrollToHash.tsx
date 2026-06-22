import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    let attempts = 0;
    let timer = 0;

    const scrollToTarget = () => {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < 8) {
        timer = window.setTimeout(scrollToTarget, 50);
      }
    };

    scrollToTarget();

    return () => {
      window.clearTimeout(timer);
    };
  }, [hash, pathname]);

  return null;
}
