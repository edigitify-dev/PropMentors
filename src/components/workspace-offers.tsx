"use client";

import Image from "next/image";
import { useState } from "react";
import { AccountCircle } from "./icons";

const offers = [
  {
    id: "managed",
    title: "Managed Offices",
    description: "Fully managed, ready-to-use workspaces with everything your business needs.",
    image: "/images/offers/managed-offices.png",
    width: 736,
    height: 1008,
    alt: "Commercial property advisers reviewing an agreement together",
  },
  {
    id: "coworking",
    title: "Co-Working Spaces",
    description: "Flexible spaces for teams that want room to grow.",
    image: "/images/glance/clients.png",
    width: 586,
    height: 1024,
    alt: "A team collaborating around a shared workspace table",
  },
  {
    id: "conventional",
    title: "Conventional Leasing",
    description: "Dedicated spaces with greater control and flexibility.",
    image: "/images/glance/leased-space.png",
    width: 972,
    height: 1024,
    alt: "An open office with dedicated desks and meeting spaces",
  },
];

export function WorkspaceOffers() {
  const [active, setActive] = useState(0);

  return (
    <section className="workspace-offers" id="workspace-offers" aria-labelledby="offers-heading" data-node-id="358:2477">
      <div className="offers-heading">
        <div className="section-badge" data-node-id="358:2531">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>WHAT WE OFFER</span>
        </div>
        <div className="offers-heading-row">
          <h2 id="offers-heading">More than finding a property</h2>
          <p>Whether you need a ready-to-use office, flexible workspace or a conventional commercial space, we&apos;ll help you find the right fit.</p>
        </div>
      </div>

      <div className="offers-content">
        <div className="offers-cards" aria-label="Workspace options" data-node-id="358:2488">
          {offers.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              className={`offer-card${active === index ? " is-active" : ""}`}
              aria-pressed={active === index}
              aria-controls="offer-preview"
              aria-labelledby={`offer-title-${offer.id}`}
              aria-describedby={active === index ? `offer-description-${offer.id}` : undefined}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setActive(index); }}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span className="offer-card-heading"><AccountCircle width={64} height={64} /><span id={`offer-title-${offer.id}`}>{offer.title}</span></span>
              <span className="offer-description" id={`offer-description-${offer.id}`} aria-hidden={active !== index}><span>{offer.description}</span></span>
            </button>
          ))}
        </div>

        <div className="offer-preview" id="offer-preview" data-active-offer={offers[active].id} data-node-id="358:2510">
          {offers.map((offer, index) => (
            <div key={offer.id} className={`offer-image offer-image-${offer.id}${active === index ? " is-active" : ""}`} aria-hidden={active !== index}>
              <Image src={offer.image} alt={offer.alt} width={offer.width} height={offer.height} unoptimized />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
