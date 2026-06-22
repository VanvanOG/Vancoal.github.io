import { gsap } from "gsap";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef, useRef } from "react";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  contentStrength?: number;
  strength?: number;
  zoneClassName?: string;
}

const assignRef = (ref: Ref<HTMLSpanElement> | undefined, value: HTMLSpanElement | null) => {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
};

const MagneticButton = forwardRef<HTMLSpanElement, MagneticButtonProps>(function MagneticButton(
  {
    children,
    className,
    contentStrength = 0.46,
    strength = 0.24,
    type = "button",
    zoneClassName = "",
    ...buttonProps
  },
  forwardedRef,
) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const zoneRef = useRef<HTMLSpanElement | null>(null);

  const moveToPointer = (clientX: number, clientY: number) => {
    const button = buttonRef.current;
    const zone = zoneRef.current;

    const content = contentRef.current;

    if (!button || !content || !zone) {
      return;
    }

    const rect = zone.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });

    gsap.to(content, {
      x: x * contentStrength,
      y: y * contentStrength,
      duration: 0.34,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const resetPosition = () => {
    const button = buttonRef.current;
    const content = contentRef.current;

    if (!button || !content) {
      return;
    }

    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
      overwrite: true,
    });

    gsap.to(content, {
      x: 0,
      y: 0,
      duration: 0.62,
      ease: "elastic.out(1, 0.45)",
      overwrite: true,
    });
  };

  return (
    <span
      className={`magnetic-zone${zoneClassName ? ` ${zoneClassName}` : ""}`}
      onPointerLeave={resetPosition}
      onPointerMove={(event) => moveToPointer(event.clientX, event.clientY)}
      ref={(node) => {
        zoneRef.current = node;
        assignRef(forwardedRef, node);
      }}
    >
      <button className={className} ref={buttonRef} type={type} {...buttonProps}>
        <span className="magnetic-content" ref={contentRef}>
          {children}
        </span>
      </button>
    </span>
  );
});

export default MagneticButton;
