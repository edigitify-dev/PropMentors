"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./scroll-header.module.css";

export function ScrollHeader({ className, children }: { className: string; children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);
  const floatingRef = useRef<HTMLElement>(null);
  const [visibility, setVisibility] = useState({ ready: false, hidden: false, floating: false });

  useEffect(() => {
    let previousY = window.scrollY;
    let direction = 0;
    let distance = 0;
    let hidden = false;
    let frame = 0;

    function update() {
      frame = 0;
      // Clamp elastic scrolling so bouncing at either edge cannot reverse the navbar.
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = Math.max(0, Math.min(window.scrollY, maxY));
      const delta = currentY - previousY;
      if (delta !== 0) {
        const nextDirection = Math.sign(delta);
        distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
        if (distance >= 8) hidden = direction > 0;
      }
      if (currentY <= 80) hidden = false;
      if (headerRef.current?.querySelector(":focus-visible") || floatingRef.current?.querySelector(":focus-visible")) hidden = false;
      previousY = currentY;

      const floating = !hidden && (headerRef.current?.getBoundingClientRect().top ?? 0) < 0;
      setVisibility((previous) => previous.ready && previous.hidden === hidden && previous.floating === floating
        ? previous
        : { ready: true, hidden, floating });
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return <>
    <header ref={headerRef} className={`${className} ${styles.original}`} data-hidden={visibility.hidden || visibility.floating} inert={visibility.hidden || visibility.floating}>
      {children}
    </header>
    {visibility.ready && createPortal(
      <header ref={floatingRef} className={`${className} ${styles.floating}`} data-visible={visibility.floating} inert={!visibility.floating} aria-hidden={!visibility.floating}>
        {children}
      </header>,
      document.body,
    )}
  </>;
}
