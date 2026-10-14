"use client";

import { useEffect, useRef } from "react";

type ContentMotion = {
  element: HTMLElement;
  x: number;
  y: number;
  scale: number;
};

/** Expands the photo and interpolates the composition to its full-screen layout. */
export function useHeroExpansion() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    const hero = heroRef.current;
    const photo = photoRef.current;
    if (!track || !pin || !hero || !photo) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileLayout = window.matchMedia("(max-width: 820px)");
    const compactLandscape = window.matchMedia("(max-width: 1000px) and (max-height: 600px) and (orientation: landscape)");
    let frame = 0;
    let start = 0;
    let distance = 1;
    let targetScale = 1;
    let targetX = 0;
    let targetY = 0;
    let content: ContentMotion[] = [];

    function render() {
      frame = 0;
      const progress = reducedMotion.matches || compactLandscape.matches ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      // Smooth endpoints without adding lag between the scroll and the image.
      const eased = progress * progress * (3 - 2 * progress);
      pin!.style.setProperty("--hero-expansion", String(eased));
      pin!.style.setProperty("--hero-photo-x", `${targetX * eased}px`);
      pin!.style.setProperty("--hero-photo-y", `${targetY * eased}px`);
      pin!.style.setProperty("--hero-photo-scale", String(1 + (targetScale - 1) * eased));
      for (const motion of content) {
        motion.element.style.setProperty("--hero-content-x", `${motion.x * eased}px`);
        motion.element.style.setProperty("--hero-content-y", `${motion.y * eased}px`);
        motion.element.style.setProperty("--hero-content-scale", String(1 + (motion.scale - 1) * eased));
      }
    }

    function scheduleRender() {
      if (!frame) frame = window.requestAnimationFrame(render);
    }

    function measure() {
      const viewportHeight = window.innerHeight;
      const viewportWidth = document.documentElement.clientWidth;
      const desktop = viewportWidth > 1000;
      const isMobile = viewportWidth <= 820;

      hero!.style.setProperty("--hero-layout-scale", String(desktop ? hero!.offsetWidth / 1440 : 1));
      const overflow = Math.max(0, pin!.offsetHeight - viewportHeight);
      const trackTop = track!.getBoundingClientRect().top + window.scrollY;
      pin!.style.setProperty("--hero-sticky-top", `${-overflow}px`);
      // Pinned range holds the full-screen image.
      distance = viewportHeight * (isMobile ? 0.45 : 0.6);
      track!.style.setProperty("--hero-scroll-distance", `${viewportHeight * (isMobile ? 0.55 : 0.8)}px`);
      start = trackTop + overflow;

      const elements = Array.from(hero!.querySelectorAll<HTMLElement>(
        ".brand, .primary-nav, .header-actions, .workspace-nav, .hero-title, .hero-tagline, .hero-search-filters",
      ));
      // Always measure the original layout, including when resizing mid-scroll.
      for (const element of elements) {
        element.style.removeProperty("--hero-content-x");
        element.style.removeProperty("--hero-content-y");
        element.style.removeProperty("--hero-content-scale");
      }

      const photoWidth = photo!.offsetWidth;
      const photoHeight = photo!.offsetHeight;
      if (!photoWidth || !photoHeight) return;

      if (isMobile) {
        // Expand photo to complete screen on mobile
        targetScale = Math.max((viewportWidth + 4) / photoWidth, (viewportHeight + 4) / photoHeight);
        const photoLeft = hero!.offsetLeft + photo!.offsetLeft;
        const photoTop = photo!.offsetTop;
        targetX = (viewportWidth - photoWidth * targetScale) / 2 - photoLeft;
        targetY = (viewportHeight - photoHeight * targetScale) / 2 - photoTop + overflow;
        content = [];
        scheduleRender();
        return;
      }

      // Bleed beyond the viewport so the rounded edges leave the frame.
      targetScale = Math.max((viewportWidth + 48) / photoWidth, (viewportHeight + 48) / photoHeight);
      const photoLeft = hero!.offsetLeft + photo!.offsetLeft;
      targetX = (viewportWidth - photoWidth * targetScale) / 2 - photoLeft;
      targetY = overflow - 24 - photo!.offsetTop;

      const pinTop = pin!.getBoundingClientRect().top;
      const scale = desktop ? viewportWidth / hero!.offsetWidth : 1;
      const bounds = new Map(elements.map(element => [element, element.getBoundingClientRect()]));
      const filters = hero!.querySelector<HTMLElement>(".hero-search-filters")!;

      content = elements.filter(element => bounds.get(element)!.width > 0).map(element => {
        const rect = bounds.get(element)!;
        let x = rect.left;
        let y = rect.top - pinTop - overflow;
        let endScale = scale;
        if (element.classList.contains("brand")) {
          x = desktop ? viewportWidth * 0.068 : 32;
          y = desktop ? viewportHeight * 0.016 : 20;
        } else if (element.classList.contains("primary-nav")) {
          x = (viewportWidth - rect.width * scale) / 2;
          y = desktop ? viewportHeight * 0.016 : 20;
        } else if (element.classList.contains("header-actions")) {
          x = viewportWidth - (desktop ? viewportWidth * 0.067 : 32) - rect.width * scale;
          y = desktop ? viewportHeight * 0.016 : 20;
        } else if (element.classList.contains("workspace-nav")) {
          y = desktop ? viewportHeight * 0.222 : 110;
          endScale = desktop ? scale * 1.14 : 1;
        } else if (element.classList.contains("hero-title")) {
          y = desktop ? viewportHeight * 0.27 : 150;
          endScale = desktop ? scale * (128 / 110) : 1;
        } else if (element.classList.contains("hero-tagline")) {
          const title = hero!.querySelector<HTMLElement>(".hero-title")!;
          y = desktop ? viewportHeight * 0.388 : Math.max(200, 150 + bounds.get(title)!.height + 12);
          endScale = desktop ? scale * (32 / 24) : 1;
        } else if (element.classList.contains("hero-search-filters")) {
          y = desktop ? Math.min(viewportHeight * (741 / 940), viewportHeight - rect.height - 48) : viewportHeight - 32 - bounds.get(filters)!.height;
        }
        return { element, x: x - rect.left, y: y + overflow - (rect.top - pinTop), scale: endScale };
      });
      scheduleRender();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    const filters = hero.querySelector<HTMLElement>(".hero-search-filters");
    if (filters) observer.observe(filters);
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    mobileLayout.addEventListener("change", measure);
    compactLandscape.addEventListener("change", measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
      mobileLayout.removeEventListener("change", measure);
      compactLandscape.removeEventListener("change", measure);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return { trackRef, pinRef, heroRef, photoRef };
}
