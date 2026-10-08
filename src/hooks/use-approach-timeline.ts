"use client";

import { useEffect, useRef } from "react";

export function useApproachTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const section = sectionRef.current;
    const timeline = timelineRef.current;
    const list = stepsRef.current;
    if (!track || !pin || !section || !timeline || !list) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const steps = Array.from(list.querySelectorAll<HTMLElement>(".approach-step"));
    let frame = 0;
    let disposed = false;
    let start = 0;
    let distance = 1;
    let centers: number[] = [];
    let lineWidth = 1;
    let viewportWidth = 1;

    function render() {
      frame = 0;
      const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      if (!centers.length) return;
      // Fill from the first point to the end of the line, holding the last
      // point while the remaining tail fills before the section releases.
      const lineX = centers[0] + (lineWidth - centers[0]) * progress;
      const dotX = Math.min(lineX, centers[centers.length - 1]);
      let active = 0;
      for (let index = 1; index < centers.length; index++) {
        if (!reducedMotion.matches && lineX + 0.5 >= centers[index]) active = index;
      }
      // Keep the current step readable throughout its beat on narrow screens.
      const shift = reducedMotion.matches ? 0 : Math.min(Math.max(0, lineWidth - viewportWidth), Math.max(0, centers[active] - viewportWidth / 2));
      list!.style.setProperty("--approach-line-x", `${lineX}px`);
      list!.style.setProperty("--approach-dot-x", `${dotX - centers[0]}px`);
      list!.style.setProperty("--approach-pan-x", `${-shift}px`);
      section!.style.setProperty("--approach-progress", String(progress));
      steps.forEach((step, index) => {
        step.dataset.active = String(index === active);
        if (index === active) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      section!.dataset.activeStep = String(active);
    }

    function scheduleRender() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    function measure() {
      if (disposed) return;
      track!.dataset.animated = String(!reducedMotion.matches);
      const height = window.innerHeight;
      const overflow = Math.max(0, pin!.offsetHeight - height);
      pin!.style.setProperty("--approach-sticky-top", `${-overflow}px`);
      start = track!.getBoundingClientRect().top + window.scrollY + overflow;
      distance = height * 1.8;
      track!.style.setProperty("--approach-scroll-distance", reducedMotion.matches ? "0px" : `${distance + height * 0.25}px`);
      const listLeft = list!.getBoundingClientRect().left;
      centers = steps.map(step => {
        const icon = step.querySelector<HTMLElement>(".approach-icon")!.getBoundingClientRect();
        return icon.left + icon.width / 2 - listLeft;
      });
      lineWidth = list!.offsetWidth;
      viewportWidth = timeline!.offsetWidth;
      scheduleRender();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(timeline);
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    void document.fonts.ready.then(measure);
    measure();

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return { trackRef, pinRef, sectionRef, timelineRef, stepsRef };
}
