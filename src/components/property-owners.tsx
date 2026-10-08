"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft } from "./icons";

const benefits = [
  { title: "Reach", description: "Get discovered by active space seekers." },
  { title: "Visibility", description: "Showcase your property with a professional listing." },
  { title: "Enquiries", description: "Connect with businesses looking for the right space." },
];

export function PropertyOwners() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  async function prepareListing(form: HTMLFormElement) {
    const data = new FormData(form);
    const listing = `Commercial property listing\nOwner: ${data.get("name")}\nEmail: ${data.get("email")}\nProperty: ${data.get("property")}\nLocation: ${data.get("location")}\nDetails: ${data.get("details")}`;
    try {
      await navigator.clipboard.writeText(listing);
      setCopied(true);
      setDownloaded(false);
    } catch {
      const url = URL.createObjectURL(new Blob([listing], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-property-listing.txt";
      link.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setCopied(false);
    }
  }

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
          <button className="owners-list-button" type="button" onClick={() => { setCopied(false); setDownloaded(false); dialogRef.current?.showModal(); }}>List Your Space <ChevronLeft /></button>
        </div>
      </div>

      <dialog className="hero-dialog" ref={dialogRef} aria-labelledby="owner-listing-title" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className="dialog-content">
          <button className="dialog-close" aria-label="Close listing draft" onClick={() => dialogRef.current?.close()}>×</button>
          <p className="dialog-eyebrow">PROPMENTORS</p>
          <h2 id="owner-listing-title">List your space</h2>
          <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void prepareListing(event.currentTarget); }}>
            <label>Your name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>Property name<input name="property" placeholder="Building or commercial space name" required /></label>
            <label>Location<input name="location" placeholder="City and area" required /></label>
            <label>Property details<textarea name="details" placeholder="Space type, size, asking rent and availability" rows={3} required /></label>
            <p className="form-note">Prepare a listing draft to share with PropMentors.</p>
            <button className="dialog-primary" type="submit">{copied ? "Listing draft copied" : "Copy listing draft"}</button>
            <p className="copy-status" role="status">{copied ? "Your listing draft is ready to paste and share." : downloaded ? "Your listing draft has been downloaded." : ""}</p>
          </form>
        </div>
      </dialog>
    </section>
  );
}
