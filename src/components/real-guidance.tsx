"use client";

import Image from "next/image";
import { useState } from "react";

const principles = [
  {
    id: "experience",
    title: "Experience",
    description: "We bring practical commercial real estate experience to every space search and decision.",
    image: "/images/guidance/experience.png",
    width: 1024,
    height: 683,
    node: "346:1821",
  },
  {
    id: "perspective",
    title: "Perspective",
    description: "Because the right space isn't just about rent - it's about location, business needs and long-term fit.",
    image: "/images/guidance/perspective.png",
    width: 4096,
    height: 2733,
    node: "346:1839",
  },
  {
    id: "clarity",
    title: "Clarity",
    description: "We simplify your options so you can compare, evaluate and move forward with confidence.",
    image: "/images/guidance/clarity.png",
    width: 1024,
    height: 683,
    node: "346:1830",
  },
];

type GuidanceProps = {
  id?: string;
  heading?: string;
  introduction?: string;
  showBadge?: boolean;
  cards?: { title: string; description: string }[];
};

export function RealGuidance({ id = "real-guidance", heading = "Real Estate decisions deserve real guidance", introduction = "Complete the process with practical advice, relevant options and hands-on support - from search to closure.", showBadge = true, cards }: GuidanceProps = {}) {
  const [active, setActive] = useState(0);
  const labelPrefix = id === "real-guidance" ? "guidance" : id;
  const headingId = `${labelPrefix}-heading`;
  return (
    <section className="real-guidance" id={id} aria-labelledby={headingId} data-node-id="346:1856">
      <div className="guidance-heading">
        {showBadge && <div className="section-badge" data-node-id="346:1851">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>WHY PROPMENTORS</span>
        </div>}
        <div className="guidance-heading-row">
          <h2 id={headingId}>{heading}</h2>
          <p>{introduction}</p>
        </div>
      </div>

      <div className="guidance-cards">
        {principles.map((principle, index) => (
          <article className={`guidance-card guidance-card-${principle.id}`} key={principle.id} aria-labelledby={`${labelPrefix}-${principle.id}-title`} data-node-id={principle.node}>
            <div className="guidance-card-content">
              <div className="guidance-card-heading">
                <span className="guidance-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3 id={`${labelPrefix}-${principle.id}-title`}>{cards?.[index]?.title ?? principle.title}</h3>
              </div>
              <p>{cards?.[index]?.description ?? principle.description}</p>
            </div>
            <div className={`guidance-photo guidance-photo-${principle.id}`} aria-hidden="true">
              <Image src={principle.image} alt="" width={principle.width} height={principle.height} unoptimized />
            </div>
          </article>
        ))}
      </div>

      <div className="guidance-mobile-content" aria-label="Why PropMentors options">
        <div className="guidance-mobile-cards" role="tablist">
          {principles.map((principle, index) => {
            const title = cards?.[index]?.title ?? principle.title;
            const description = cards?.[index]?.description ?? principle.description;
            const isActive = active === index;
            return (
              <button
                key={principle.id}
                type="button"
                className={`guidance-mobile-card${isActive ? " is-active" : ""}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(index)}
              >
                <span className="guidance-mobile-card-heading">
                  <span className="guidance-mobile-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span>{title}</span>
                </span>
                <span className="guidance-mobile-description" aria-hidden={!isActive}>
                  <span>{description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="guidance-mobile-preview" aria-hidden="true">
          {principles.map((principle, index) => (
            <div
              key={principle.id}
              className={`guidance-mobile-image${active === index ? " is-active" : ""}`}
            >
              <Image src={principle.image} alt="" width={principle.width} height={principle.height} unoptimized />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
