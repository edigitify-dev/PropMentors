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
    const mobile = window.matchMedia("(max-width: 767px)");
    const steps = Array.from(list.querySelectorAll<HTMLElement>(".approach-step"));
    let frame = 0;
    let disposed = false;
    let start = 0;
    let distance = 1;
    let centers: number[] = [];
    let lineWidth = 1;
    let viewportWidth = 1;
    let mobileCenters: number[] = [];
    let mobileStart = 0;
    let mobileDistance = 1;
    let mobileTotalHeight = 1;

    function render() {
      frame = 0;
      if (mobile.matches) {
        for (const property of ["--approach-line-x", "--approach-dot-x", "--approach-pan-x"]) list!.style.removeProperty(property);
        
        const progress = reducedMotion.matches
          ? 1
          : Math.min(1, Math.max(0, (window.scrollY - mobileStart) / mobileDistance));
        
        const lineHeight = mobileTotalHeight * progress;
        list!.style.setProperty("--approach-mobile-line-height", `${lineHeight}px`);
        list!.style.setProperty("--approach-mobile-dot-y", `${lineHeight}px`);
        list!.style.setProperty("--approach-mobile-progress", String(progress));

        const y0 = mobileCenters[0] ?? 42;
        let activeIndex = 0;
        steps.forEach((step, index) => {
          const stepY = (mobileCenters[index] ?? y0) - y0;
          const isReached = progress > 0 && lineHeight >= stepY - 16;
          if (isReached) activeIndex = index;
          step.dataset.reached = String(isReached);
        });

        steps.forEach((step, index) => {
          const isActive = index === activeIndex;
          step.dataset.active = String(isActive);
          if (isActive) step.setAttribute("aria-current", "step");
          else step.removeAttribute("aria-current");
        });

        section!.dataset.activeStep = String(activeIndex);
        return;
      }
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
      if (mobile.matches) {
        pin!.style.setProperty("--approach-sticky-top", "0px");
        track!.style.setProperty("--approach-scroll-distance", "0px");
        
        const listRect = list!.getBoundingClientRect();
        mobileCenters = steps.map(step => {
          const circle = step.querySelector<HTMLElement>(".approach-mobile-number");
          if (!circle) return step.offsetTop + 42;
          const circleRect = circle.getBoundingClientRect();
          return circleRect.top + circleRect.height / 2 - listRect.top;
        });

        const y0 = mobileCenters[0] ?? 42;
        const yLast = mobileCenters[mobileCenters.length - 1] ?? (y0 + 300);
        mobileTotalHeight = Math.max(1, yLast - y0);
        list!.style.setProperty("--approach-mobile-total-height", `${mobileTotalHeight}px`);
        list!.style.setProperty("--approach-mobile-start-y", `${y0}px`);

        const circle0 = steps[0]?.querySelector<HTMLElement>(".approach-mobile-number");
        const circleLast = steps[steps.length - 1]?.querySelector<HTMLElement>(".approach-mobile-number");
        const triggerY = window.innerHeight * 0.6;
        
        if (circle0 && circleLast) {
          const c0Top = circle0.getBoundingClientRect().top + window.scrollY;
          const cLastTop = circleLast.getBoundingClientRect().top + window.scrollY;
          mobileStart = c0Top - triggerY;
          mobileDistance = Math.max(1, cLastTop - triggerY - mobileStart);
        } else {
          const trackTop = track!.getBoundingClientRect().top + window.scrollY;
          mobileStart = trackTop - triggerY;
          mobileDistance = Math.max(1, track!.offsetHeight);
        }

        scheduleRender();
        return;
      }
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
    mobile.addEventListener("change", measure);
    void document.fonts.ready.then(measure);
    measure();

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
      mobile.removeEventListener("change", measure);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return { trackRef, pinRef, sectionRef, timelineRef, stepsRef };
}
