import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { interactionSettings as settings } from '../data/interactionSettings';

/** Observe existing reveal state; never create a second scroll/reveal controller. */
export default function useCaseAccentMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet<Element>();
    const selector = '.diagram-arrow > path,.vertical-link > path,.bar-fill';
    const context = gsap.context(() => {}, root);
    const scan = () => context.add(() => {
      root.querySelectorAll<HTMLElement>('[data-revealed="true"]').forEach(module => {
        const targets = [...module.querySelectorAll<SVGPathElement | HTMLElement>(selector)];
        if (reduced.matches || module.dataset.revealInstant === 'true') {
          gsap.killTweensOf(targets);
          gsap.set(targets, {clearProps:'strokeDasharray,strokeDashoffset,transform,transformOrigin'});
          targets.forEach(target => seen.add(target));
          return;
        }
        targets.forEach(target => {
          if (seen.has(target)) return;
          seen.add(target);
          if (target instanceof SVGPathElement) {
            const length = target.getTotalLength();
            gsap.fromTo(target, {strokeDasharray:length,strokeDashoffset:length}, {
              strokeDashoffset:0,duration:settings.draw/1000,
              delay:target.closest('.after') ? settings.stagger/1000*3 : 0,ease:'power2.inOut',
              onComplete:()=>{gsap.set(target,{clearProps:'strokeDasharray,strokeDashoffset'});},
            });
          } else {
            gsap.fromTo(target,{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:settings.draw/1000,ease:'power2.out'});
          }
        });
      });
    });
    const observer = new MutationObserver(scan);
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:['data-revealed','data-reveal-instant']});
    reduced.addEventListener('change',scan);scan();
    return () => { observer.disconnect();reduced.removeEventListener('change',scan);context.revert(); };
  }, [rootRef]);
}
