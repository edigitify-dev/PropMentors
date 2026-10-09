"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { ChevronLeft, PlayCircle } from "@/components/icons";

const insights = [
  { id: "office", node: "352:2417", image: "/images/spaces/space-04.png", width: 736, height: 1308, alt: "A commercial office interior" },
  { id: "featured", node: "352:2421", image: "/images/insights/know-your-lease.png", width: 2160, height: 2700, alt: "Office floor plan showing carpet area, built-up area, and shared common areas" },
  { id: "cover-one", node: "352:2425", image: "/images/insights/cover-one.png", width: 2160, height: 2700, alt: "Before you sign that lease: check these 6 things. Know Your Lease, Vol. 001." },
  { id: "cover-two", node: "352:2429", image: "/images/insights/cover-two.png", width: 2160, height: 2700, alt: "The Leasing Playbook / 01: Why shop placement matters more than shop size?" },
  { id: "building", node: "352:2433", image: "/images/insights/building.png", width: 816, height: 1456, alt: "A commercial building exterior" },
];

export function Insights() {
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = windowRef.current;
    if (!viewport) return;
    const rail = viewport.querySelector<HTMLOListElement>(".insights-rail");
    const featured = viewport.querySelector<HTMLElement>('[data-copy="1"].insight-card-featured');
    if (!rail || !featured) return;

    let cycleWidth = 0;
    let settleTimer: ReturnType<typeof setTimeout>;
    const normalize = () => {
      if (!cycleWidth) return;
      const offset = ((viewport.scrollLeft - cycleWidth) % cycleWidth + cycleWidth) % cycleWidth;
      const position = cycleWidth + offset;
      // Identical copies allow this repositioning without a visible jump.
      if (Math.abs(viewport.scrollLeft - position) > 1) viewport.scrollTo({ left: position, behavior: "instant" });
    };
    const measure = () => {
      const first = rail.querySelector<HTMLElement>('[data-copy="0"]');
      const middle = rail.querySelector<HTMLElement>('[data-copy="1"]');
      if (!first || !middle) return;
      const oldWidth = cycleWidth;
      const oldPosition = viewport.scrollLeft;
      cycleWidth = middle.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (!oldWidth) viewport.scrollTo({ left: featured.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft - parseFloat(getComputedStyle(rail).paddingLeft), behavior: "instant" });
      else if (Math.abs(oldWidth - cycleWidth) > 1) viewport.scrollTo({ left: oldPosition / oldWidth * cycleWidth, behavior: "instant" });
      normalize();
    };
    const onScroll = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(normalize, 120);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(rail);
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", normalize);
    return () => {
      clearTimeout(settleTimer);
      observer.disconnect();
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", normalize);
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
            {[0, 1, 2].flatMap(copy => insights.map(insight => (
              <li className={`insight-card insight-card-${insight.id}`} key={`${copy}-${insight.id}`} data-copy={copy} aria-hidden={copy !== 1 ? true : undefined} data-node-id={copy === 1 ? insight.node : undefined}>
                <div className="insight-image">
                  {insight.id === "cover-two" && <Image className="insight-cover-background" src="/images/spaces/space-06.png" alt="" width={736} height={1104} unoptimized />}
                  <Image src={insight.image} alt={insight.alt} width={insight.width} height={insight.height} unoptimized />
                  {insight.id === "featured" && <div className="insight-shade" />}
                </div>
                {insight.id === "featured" && <div className="insight-caption" data-node-id={copy === 1 ? "352:2437" : undefined}>
                  <h3>KNOW YOUR LEASE</h3>
                  <p>What&apos;s actually included in your office super area?</p>
                </div>}
                {insight.id === "office" && <span className="insight-play" aria-hidden="true"><PlayCircle /></span>}
              </li>
            )))}
          </ol>
        </div>
        <div className="stories-controls insights-controls" data-node-id="352:2440">
          <button type="button" aria-label="Previous leasing insights" aria-controls="insights" onClick={() => move(-1)}><span><ChevronLeft /></span></button>
          <button type="button" aria-label="Next leasing insights" aria-controls="insights" onClick={() => move(1)}><span><ChevronLeft /></span></button>
        </div>
      </div>
    </section>
  );
}
