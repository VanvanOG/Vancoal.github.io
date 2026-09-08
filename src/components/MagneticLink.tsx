import { useEffect, useRef, type AnchorHTMLAttributes } from 'react';
import { gsap } from 'gsap';
import { interactionSettings } from '../data/interactionSettings';

/** Preserve real anchor semantics (mailto, context menu and keyboard activation). */
export default function MagneticLink({children,...props}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const zoneRef=useRef<HTMLSpanElement>(null);
  const linkRef=useRef<HTMLAnchorElement>(null);
  useEffect(()=>{
    const zone=zoneRef.current,link=linkRef.current;
    if(!zone||!link)return;
    const media=gsap.matchMedia();
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',()=>{
      const xTo=gsap.quickTo(link,'x',{duration:.25,ease:'power2.out'});
      const yTo=gsap.quickTo(link,'y',{duration:.25,ease:'power2.out'});
      const reset=()=>{xTo(0);yTo(0);};
      const move=(event:PointerEvent)=>{
        const rect=zone.getBoundingClientRect();
        const limit=interactionSettings.magnet;
        const clamp=(value:number)=>Math.max(-limit,Math.min(limit,value));
        xTo(clamp((event.clientX-rect.left-rect.width/2)*.7));
        yTo(clamp((event.clientY-rect.top-rect.height/2)*.7));
      };
      zone.addEventListener('pointermove',move);
      zone.addEventListener('pointerleave',reset);
      zone.addEventListener('pointerdown',reset);
      window.addEventListener('blur',reset);
      return ()=>{
        zone.removeEventListener('pointermove',move);
        zone.removeEventListener('pointerleave',reset);
        zone.removeEventListener('pointerdown',reset);
        window.removeEventListener('blur',reset);
      };
    });
    return ()=>media.revert();
  },[]);
  return <span className="magnetic-zone contact-mail-zone" ref={zoneRef}><a {...props} ref={linkRef}>{children}</a></span>;
}
