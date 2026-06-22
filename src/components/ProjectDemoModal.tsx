import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import type { ProjectInteractiveDemo } from "../types";

interface ProjectDemoModalProps {
  demo: ProjectInteractiveDemo | null;
  onClose: () => void;
}

export default function ProjectDemoModal({ demo, onClose }: ProjectDemoModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!demo) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [demo]);

  useEffect(() => {
    if (!demo) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [demo, onClose]);

  useEffect(() => {
    if (!demo) {
      return;
    }

    setIsLoaded(false);
    setIsSlow(false);

    const slowTimer = window.setTimeout(() => {
      setIsSlow(true);
    }, 8000);

    return () => {
      window.clearTimeout(slowTimer);
    };
  }, [demo, reloadKey]);

  if (!demo) {
    return null;
  }

  const reloadDemo = () => {
    setReloadKey((key) => key + 1);
  };

  return (
    <div
      className="project-demo-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-demo-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="project-demo-shell" onMouseDown={(event) => event.stopPropagation()}>
        <header className="project-demo-header">
          <div>
            <span>INTERACTIVE DEMO</span>
            <h2 id="project-demo-title">{demo.title}</h2>
            <p>{demo.description}</p>
          </div>
          <button className="project-demo-close" type="button" onClick={onClose} aria-label="Close demo">
            <X aria-hidden="true" size={22} />
          </button>
        </header>

        <div className="project-demo-frame-wrap">
          <iframe
            key={reloadKey}
            className="project-demo-frame"
            src={demo.src}
            title={demo.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            onLoad={() => setIsLoaded(true)}
          />
          <div className={`project-demo-loader${isLoaded ? " is-loaded" : ""}`} aria-hidden={isLoaded}>
            <div className="project-demo-loader-grid" />
            <span>LOADING DEMO</span>
            <p>{isSlow ? "Demo loading is taking longer than expected." : "Preparing playable prototype..."}</p>
            {isSlow ? (
              <button type="button" onClick={reloadDemo}>
                <RefreshCw aria-hidden="true" size={15} />
                Retry
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
