interface ControllerHintsProps {
  left?: string;
  right?: string;
  placement?: "overlay" | "inline";
  shortcutPage?: "home" | "contact";
}

function ScrollWheelIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="24" height="18" viewBox="0 0 28 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="2" width="12" height="18" rx="6" />
      <path d="M9 5.5v3" strokeWidth="1.7" />
      <path d={direction === "up" ? "M22 14.5v-7m-2.5 2.5L22 7.5l2.5 2.5" : "M22 7.5v7m-2.5-2.5 2.5 2.5 2.5-2.5"} strokeWidth="1.3" opacity="0.85" />
    </svg>
  );
}

export default function ControllerHints({
  left = "SWITCH BETWEEN PARTS",
  right = "BACK TO TIMELINE",
  placement = "overlay",
  shortcutPage,
}: ControllerHintsProps) {
  return (
    <div
      className={`controller-hints controller-hints-${placement}`}
      aria-label="Game menu style operation hints"
    >
      <div className="hint-group">
        <span className="keycap" role="img" aria-label="鼠标滚轮向上" title="鼠标滚轮向上"><ScrollWheelIcon direction="up" /></span>
        <span className="keycap" role="img" aria-label="鼠标滚轮向下" title="鼠标滚轮向下"><ScrollWheelIcon direction="down" /></span>
        <span>{left}</span>
      </div>
      <div className="hint-group">
        {shortcutPage ? <>
          <span className="keycap keycap-round" data-shortcut={shortcutPage === "home" ? "c" : "h"}>{shortcutPage === "home" ? "C" : "H"}</span>
          <span>{shortcutPage === "home" ? "CONTACT" : "HOME"}</span>
          <span className="keycap keycap-round" data-shortcut="p">P</span>
          <span>PROJECTS</span>
        </> : <>
        <span className="keycap keycap-round">Y</span>
        <span>VIEW EVIDENCE</span>
        <span className="keycap keycap-round">B</span>
        <span>{right}</span>
        </>}
      </div>
    </div>
  );
}
