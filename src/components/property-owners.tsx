"use client";

import Image from "next/image";
import { useRef } from "react";
import { PropertyListingDialog } from "./property-listing-dialog";
import { ChevronLeft } from "./icons";

const benefits = [
  { title: "Reach", description: "Get discovered by active space seekers." },
  { title: "Visibility", description: "Showcase your property with a professional listing." },
  { title: "Enquiries", description: "Connect with businesses looking for the right space." },
];

export function PropertyOwners() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <section className="property-owners" id="property-owners" aria-labelledby="owners-heading" data-node-id="470:667">
      <div className="owners-inner">
        <div className="owners-heading">
          <div className="section-badge" data-node-id="470:689">
            <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
            <span>FOR PROPERTY OWNERS &amp; DEVELOPERS</span>
          </div>
          <div className="owners-heading-row">
            <h2 id="owners-heading">Have a space to lease?</h2>
            <div className="owners-intro">
              <p>Put your property in front of businesses actively looking for their next workspace.</p>
              <p>List your commercial space with PropMentors and start receiving relevant enquiries.</p>
            </div>
          </div>
        </div>
        <div className="owners-benefits-panel" data-node-id="470:704">
          <div className="owners-benefits-content">
            <h3>Why list with PropMentors?</h3>
            <ol className="owners-benefits">
              {benefits.map((benefit, index) => <li key={benefit.title}>
                <span className="owners-benefit-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div><h4>{benefit.title}</h4><p>{benefit.description}</p></div>
              </li>)}
            </ol>
          </div>
          <button className="owners-list-button" type="button" onClick={() => { dialogRef.current?.showModal(); }}>List Your Space <ChevronLeft /></button>
        </div>
      </div>

      <PropertyListingDialog dialogRef={dialogRef} />
    </section>
  );
}
