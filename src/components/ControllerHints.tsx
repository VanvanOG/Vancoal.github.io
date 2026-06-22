interface ControllerHintsProps {
  left?: string;
  right?: string;
  placement?: "overlay" | "inline";
}

export default function ControllerHints({
  left = "SWITCH BETWEEN PARTS",
  right = "BACK TO TIMELINE",
  placement = "overlay",
}: ControllerHintsProps) {
  return (
    <div
      className={`controller-hints controller-hints-${placement}`}
      aria-label="Game menu style operation hints"
    >
      <div className="hint-group">
        <span className="keycap">LB</span>
        <span className="keycap">RB</span>
        <span>{left}</span>
      </div>
      <div className="hint-group">
        <span className="keycap keycap-round">Y</span>
        <span>VIEW EVIDENCE</span>
        <span className="keycap keycap-round">B</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
