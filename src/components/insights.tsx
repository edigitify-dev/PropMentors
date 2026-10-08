"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, PlayCircle } from "@/components/icons";

export function Insights() {
  const windowRef = useRef<HTMLDivElement>(null);
  const [navigation, setNavigation] = useState({ previous: true, next: true });

  useEffect(() => {
    const viewport = windowRef.current;
    if (!viewport) return;
    const rail = viewport.querySelector<HTMLOListElement>(".insights-rail");
    const featured = viewport.querySelector<HTMLElement>(".insight-card-featured");
    if (!rail || !featured) return;

    const update = () => {
      const previous = viewport.scrollLeft > 1;
      const next = viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 1;
      setNavigation(current => current.previous === previous && current.next === next ? current : { previous, next });
    };
    viewport.scrollTo({ left: featured.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft), behavior: "instant" });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(rail);
    viewport.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  const move = (direction: number) => {
    const viewport = windowRef.current;
    const rail = viewport?.querySelector<HTMLOListElement>(".insights-rail");
    const card = rail?.querySelector<HTMLElement>(".insight-card");
    if (!viewport || !rail || !card) return;
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap);
    viewport.scrollBy({ left: direction * distance, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  return (
    <section className="insights" id="insights" aria-labelledby="insights-heading" data-node-id="352:2412">
      <div className="insights-heading">
        <div className="section-badge" data-node-id="353:2453">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>FROM THE PROPMENTORS DESK</span>
        </div>
        <div className="insights-heading-row">
          <h2 id="insights-heading"><span>Know more.</span><span>Lease smarter</span></h2>
          <p>Practical insights to help you understand commercial real estate and make better leasing decisions.</p>
        </div>
      </div>

      <div className="insights-carousel" onKeyDown={onKeyDown}>
        <div className="insights-window" ref={windowRef} tabIndex={0} role="region" aria-label="Leasing insights. Use the left and right arrow keys to browse.">
          <ol className="insights-rail" data-node-id="352:2416">
            <li className="insight-card insight-card-office" data-node-id="352:2417">
              <div className="insight-image">
                <Image src="/images/spaces/space-04.png" alt="A commercial office interior" width={736} height={1308} unoptimized />
              </div>
              <span className="insight-play" aria-hidden="true"><PlayCircle /></span>
            </li>
            <li className="insight-card insight-card-featured" data-node-id="352:2421">
              <div className="insight-image">
                <Image src="/images/insights/know-your-lease.png" alt="Office floor plan showing carpet area, built-up area, and shared common areas" width={2160} height={2700} unoptimized />
                <div className="insight-shade" />
              </div>
              <div className="insight-caption" data-node-id="352:2437">
                <h3>KNOW YOUR LEASE</h3>
                <p>What&apos;s actually included in your office super area?</p>
              </div>
            </li>
            <li className="insight-card insight-card-cover-one" data-node-id="352:2425">
              <div className="insight-image">
                <Image src="/images/insights/cover-one.png" alt="Before you sign that lease: check these 6 things. Know Your Lease, Vol. 001." width={2160} height={2700} unoptimized />
              </div>
            </li>
            <li className="insight-card insight-card-cover-two" data-node-id="352:2429">
              <div className="insight-image">
                <Image className="insight-cover-background" src="/images/spaces/space-06.png" alt="" width={736} height={1104} unoptimized />
                <Image src="/images/insights/cover-two.png" alt="The Leasing Playbook / 01: Why shop placement matters more than shop size?" width={2160} height={2700} unoptimized />
              </div>
            </li>
            <li className="insight-card insight-card-building" data-node-id="352:2433">
              <div className="insight-image">
                <Image src="/images/insights/building.png" alt="A commercial building exterior" width={816} height={1456} unoptimized />
              </div>
            </li>
          </ol>
        </div>
        <div className="stories-controls insights-controls" data-node-id="352:2440">
          <button type="button" aria-label="Previous leasing insights" aria-controls="insights" disabled={!navigation.previous} onClick={() => move(-1)}><span><ChevronLeft /></span></button>
          <button type="button" aria-label="Next leasing insights" aria-controls="insights" disabled={!navigation.next} onClick={() => move(1)}><span><ChevronLeft /></span></button>
        </div>
      </div>
    </section>
  );
}
