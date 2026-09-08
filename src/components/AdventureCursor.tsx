import { useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { interactionSettings as settings } from '../data/interactionSettings';
import '../styles/interaction-enhancement.css';

/** Body-level overlay remains above route/loading transforms, never intercepts input. */
export default function AdventureCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ring = ringRef.current, dot = dotRef.current;
    if (!ring || !dot) return;
    const media = gsap.matchMedia();
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const html = document.documentElement;
      let active = false, held = false, x = 0, y = 0, frame = 0;
      const moveX = gsap.quickTo(ring, 'x', { duration: settings.follow / 1000, ease: 'power2.out' });
      const moveY = gsap.quickTo(ring, 'y', { duration: settings.follow / 1000, ease: 'power2.out' });
      const hide = () => {
        active = false; held = false;
        html.classList.remove('adventure-cursor-active');
        gsap.set([ring, dot], { opacity: 0 });
        moveX.tween.pause(); moveY.tween.pause();
      };
      const updateTarget = (target: Element | null) => {
        const action = target?.closest('button:not(:disabled),a[href],[role="button"],summary');
        const play = action?.matches('.project-video-play');
        const drag = !action && target?.closest('.project-video-stage');
        ring.dataset.kind = play ? 'play' : drag ? 'drag' : action ? 'action' : 'default';
        ring.dataset.held = String(held);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') { hide(); return; }
        x = event.clientX; y = event.clientY;
        if (!active) gsap.set(ring, { x, y });
        gsap.set(dot, { x, y, opacity: 1 });
        gsap.set(ring, { opacity: 1 });
        moveX(x); moveY(y);
        updateTarget(event.target instanceof Element ? event.target : null);
        // Only hide the OS cursor after the overlay has a valid position.
        active = true; html.classList.add('adventure-cursor-active');
      };
      const retarget = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { if (active) updateTarget(document.elementFromPoint(x, y)); });
      };
      const down = () => { held = true; retarget(); };
      const up = () => { held = false; retarget(); };
      const visibility = () => { if (document.hidden) hide(); };
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerdown', down, { passive: true });
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', hide);
      window.addEventListener('blur', hide);
      document.addEventListener('pointerleave', hide);
      document.addEventListener('visibilitychange', visibility);
      document.addEventListener('scroll', retarget, { capture: true, passive: true });
      return () => {
        hide(); cancelAnimationFrame(frame);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', hide);
        window.removeEventListener('blur', hide);
        document.removeEventListener('pointerleave', hide);
        document.removeEventListener('visibilitychange', visibility);
        document.removeEventListener('scroll', retarget, true);
      };
    });
    return () => media.revert();
  }, []);
  const variables = { '--cursor-size': `${settings.cursorSize}px`, '--cursor-stroke': `${settings.cursorStroke}px`, '--cursor-dot': `${settings.cursorDot}px` } as CSSProperties;
  return createPortal(<>
    <div aria-hidden="true" className="adventure-cursor-ring" ref={ringRef} style={variables}><span>↔</span></div>
    <div aria-hidden="true" className="adventure-cursor-dot" ref={dotRef} style={variables} />
  </>, document.body);
}
