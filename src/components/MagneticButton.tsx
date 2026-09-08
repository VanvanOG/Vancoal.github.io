import { gsap } from "gsap";
import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef, useEffect, useRef } from "react";
import { interactionSettings } from "../data/interactionSettings";

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
  const motionRef = useRef<{ move: (x: number, y: number) => void; reset: () => void } | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const zone = zoneRef.current;
    const content = contentRef.current;
    if (!button || !content || !zone) return;
    const media = gsap.matchMedia();
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const xTo = gsap.quickTo(button, 'x', {duration:.25,ease:'power2.out'});
      const yTo = gsap.quickTo(button, 'y', {duration:.25,ease:'power2.out'});
      // The whole control moves together; avoid adding a second displacement to the icon.
      gsap.set(content, {x:0,y:0});
      const reset = () => { xTo(0);yTo(0); };
      motionRef.current = {
        move: (clientX, clientY) => {
          if (button.disabled || zone.closest('.is-dragging,.is-switching')) { reset();return; }
          const rect = zone.getBoundingClientRect();
          const limit = interactionSettings.magnet;
          const factor = Math.max(0,strength + contentStrength);
          const clamp = (value:number) => Math.max(-limit,Math.min(limit,value));
          xTo(clamp((clientX-rect.left-rect.width/2)*factor));
          yTo(clamp((clientY-rect.top-rect.height/2)*factor));
        },reset,
      };
      window.addEventListener('blur',reset);
      return () => { motionRef.current=null;window.removeEventListener('blur',reset); };
    });
    return () => { motionRef.current=null;media.revert(); };
  }, [strength,contentStrength]);

  return (
    <span
      className={`magnetic-zone${zoneClassName ? ` ${zoneClassName}` : ""}`}
      onPointerLeave={() => motionRef.current?.reset()}
      onPointerDown={() => motionRef.current?.reset()}
      onPointerMove={(event) => motionRef.current?.move(event.clientX, event.clientY)}
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
