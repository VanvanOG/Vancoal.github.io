import { useLayoutEffect, type RefObject } from 'react';
import { interactionSettings } from '../data/interactionSettings';

const targetSelector = '[data-ai-module]';
const entranceStagger = new Map([
  ['project-title-block', 0],
  ['project-status-panel', 100],
  ['project-menu', 200],
  ['project-storyline', 300],
]);
const entranceBlockerSelector = '.startup-loading, .project-open-overlay';

export function revealAiSection(section: HTMLElement | null) {
  if (!section) return;
  // A directory jump exposes its entrance, not every later module in a long chapter.
  const entrance = section.matches('[data-mars-reveal]') ? section
    : section.querySelector<HTMLElement>('.section-heading, .story-heading, [data-mars-reveal]');
  if (entrance) {
    entrance.dataset.revealInstant = 'true';
    entrance.dataset.revealed = 'true';
  }
}

export default function useAiReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(()=> {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--case-reveal-duration', `${interactionSettings.reveal}ms`);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    const items = [...root.querySelectorAll<HTMLElement>(targetSelector)];
    let observer: IntersectionObserver | undefined;
    let startupObserver: MutationObserver | undefined;
    let initializationFrame = 0;
    let firstFrame = 0;
    let revealFrame = 0;
    let resizeFrame = 0;
    let started = false;
    const peers = (item: HTMLElement) => {
      const parent = item.parentElement;
      if (mobile.matches || !parent?.matches('.ai-evidence')) return [item];
      const children = [...parent.children] as HTMLElement[];
      const index = children.indexOf(item);
      const columns = parent.classList.contains('count-3') ? 3 : 2;
      return children.slice(Math.floor(index/columns)*columns, Math.floor(index/columns)*columns+columns);
    };
    const show = (item: HTMLElement, instant = false) => peers(item).forEach(peer=> {
      if (instant) peer.dataset.revealInstant = 'true';
      if (peer.dataset.revealed === 'true') {
        observer?.unobserve(peer);
        return;
      }
      peer.dataset.revealed = 'true';
      observer?.unobserve(peer);
    });
    const observePending = () => {
      observer?.disconnect();
      if (reduced.matches || !('IntersectionObserver' in window)) {
        items.forEach(item=>show(item,true));
        return;
      }
      observer = new IntersectionObserver(entries=> {
        entries.forEach(entry=> {if(entry.isIntersecting) show(entry.target as HTMLElement);});
      },{rootMargin:`0px 0px -${innerHeight * .15}px 0px`,threshold:0});
      items.forEach(item=> { if (item.dataset.revealed !== 'true') observer?.observe(item); });
    };
    const start = () => {
      if (started) return;
      started = true;
      items.filter(item=>[...entranceStagger.keys()].some(className=>item.classList.contains(className)))
        .filter(item=>item.getBoundingClientRect().bottom>0 && item.getBoundingClientRect().top<innerHeight*.85)
        .forEach(item=>show(item));
      observePending();
    };
    const scheduleStart = () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(revealFrame);
      // A route change without startup UI still needs one painted hidden frame.
      firstFrame = requestAnimationFrame(()=> {
        revealFrame = requestAnimationFrame(start);
      });
    };
    const waitForEntranceBlockers = () => {
      if (!document.querySelector(entranceBlockerSelector)) {
        scheduleStart();
        return;
      }
      startupObserver = new MutationObserver(()=> {
        if (!document.querySelector(entranceBlockerSelector)) {
          startupObserver?.disconnect();
          scheduleStart();
        }
      });
      startupObserver.observe(document.body, {childList:true,subtree:true});
      if (!document.querySelector(entranceBlockerSelector)) {
        startupObserver.disconnect();
        scheduleStart();
      }
    };
    const focus = (event: FocusEvent) => {
      const item = (event.target as Element).closest<HTMLElement>('[data-mars-reveal]');
      if(item) show(item,true);
    };
    const resize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(()=> { if (started) observePending(); });
    };
    const motionChange = () => {
      if (reduced.matches) items.forEach(item=>show(item,true));
      else if (started) observePending();
    };
    const layoutChange = () => { if (started) observePending(); };
    items.forEach(item=> {
      item.dataset.marsReveal = '';
      // Child layout effects can force the readable default style before this parent effect runs.
      // Suppress that visible-to-hidden transition until the initialized state has painted once.
      item.dataset.revealInstant = 'true';
      item.dataset.revealed = 'false';
      const stagger = [...entranceStagger].find(([className])=>item.classList.contains(className))?.[1];
      if (stagger !== undefined) item.style.setProperty('--mars-reveal-delay', `${stagger}ms`);
      else if (item.matches('.path-comparison,.strategy-map,.journey-overview,.feedback-ladder,.layout-module')) item.style.setProperty('--mars-reveal-delay','100ms');
    });
    initializationFrame = requestAnimationFrame(()=> {
      items.forEach(item=> { if (item.dataset.revealed === 'false') delete item.dataset.revealInstant; });
    });
    if (reduced.matches || !('IntersectionObserver' in window)) items.forEach(item=>show(item,true));
    else waitForEntranceBlockers();
    root.addEventListener('focusin',focus);
    reduced.addEventListener('change',motionChange);
    mobile.addEventListener('change',layoutChange);
    window.addEventListener('resize',resize);
    return ()=> {
      cancelAnimationFrame(initializationFrame); cancelAnimationFrame(firstFrame); cancelAnimationFrame(revealFrame); cancelAnimationFrame(resizeFrame);
      startupObserver?.disconnect(); observer?.disconnect();
      root.style.removeProperty('--case-reveal-duration');
      root.removeEventListener('focusin',focus);
      reduced.removeEventListener('change',motionChange); mobile.removeEventListener('change',layoutChange);
      window.removeEventListener('resize',resize);
      items.forEach(item=>{delete item.dataset.marsReveal; delete item.dataset.revealed; delete item.dataset.revealInstant; item.style.removeProperty('--mars-reveal-delay');});
    };
  },[rootRef]);
}
