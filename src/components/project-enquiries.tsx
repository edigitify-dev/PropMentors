"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUp, ChevronLeft } from "./icons";
import { PropertyListingDialog } from "./property-listing-dialog";
import styles from "./project-enquiries.module.css";

type Requirement = { name: string; mobile: string; email: string; age: string; city: string; status: string };
const requirementLabels: Record<keyof Requirement, string> = { name: "Full name", mobile: "Mobile number", email: "Email address", age: "Age", city: "Current city", status: "Current status" };

function Badge({ children }: { children: React.ReactNode }) {
  return <span className={styles.badge}><Image src="/images/glance/badge-star.svg" width={17} height={17} alt="" unoptimized /><span>{children}</span></span>;
}

export function ProjectEnquiries({ showOwners = true }: { showOwners?: boolean }) {
  const nameInput = useRef<HTMLInputElement>(null);
  const formCard = useRef<HTMLDivElement>(null);
  const reviewDialog = useRef<HTMLDialogElement>(null);
  const listingDialog = useRef<HTMLDialogElement>(null);
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const draft = requirement ? `Workspace requirement\n${Object.entries(requirement).map(([key, value]) => `${requirementLabels[key as keyof Requirement]}: ${value}`).join("\n")}` : "";

  function focusRequirement() {
    formCard.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
    nameInput.current?.focus({ preventScroll: true });
  }

  function reviewRequirement(form: HTMLFormElement) {
    const data = new FormData(form);
    setRequirement(Object.fromEntries(Object.keys(requirementLabels).map((key) => [key, String(data.get(key) ?? "").trim()])) as Requirement);
    setShareStatus("");
    reviewDialog.current?.showModal();
  }

  async function copyRequirement() {
    try {
      await navigator.clipboard.writeText(draft);
      setShareStatus("Your requirement is copied and ready to share.");
    } catch {
      const url = URL.createObjectURL(new Blob([draft], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-workspace-requirement.txt";
      link.click();
      URL.revokeObjectURL(url);
      setShareStatus("Your requirement has been downloaded and is ready to share.");
    }
  }

  return <div className={styles.sections}>
    <section className={styles.requirements} id="share-requirement" aria-labelledby="requirement-heading">
      <div className={styles.photo} aria-hidden="true"><Image src="/project%20/Hero/o.png" alt="" width={700} height={712} unoptimized /></div>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.stage}>
        <div className={styles.requirementInner}>
          <div className={styles.copy}>
            <Badge>FIND YOUR NEXT SPACE</Badge>
            <h2 id="requirement-heading">Didn’t find what<br /> you’re looking for?</h2>
            <p>Tell us what you need. We’ll find the<br /> options for you.</p>
            <button className={styles.shareButton} type="button" onClick={focusRequirement}>Share My Requirement<ArrowUp /></button>
          </div>
          <div className={styles.formCard} ref={formCard}>
            <h3 id="requirement-form-heading">Find your space</h3>
            <p>Tell us a little about your requirement and we’ll get back to you with availability, pricing and similar options.</p>
            <form aria-labelledby="requirement-form-heading" onSubmit={(event) => { event.preventDefault(); reviewRequirement(event.currentTarget); }}>
              <div className={styles.fields}>
                <label>Full Name*<input name="name" ref={nameInput} autoComplete="name" placeholder="Rohan Gupta" required /></label>
                <label>Mobile Number*<input name="mobile" type="tel" autoComplete="tel" placeholder="+91 123 4567 890" required /></label>
                <label>Email Address*<input name="email" type="email" autoComplete="email" placeholder="Mail@gmail.com" required /></label>
                <label>Your Age*<input name="age" type="number" min="1" max="120" placeholder="Your age" required /></label>
                <label className={styles.fullWidth}>Current City*<input name="city" autoComplete="address-level2" placeholder="Dehradun, Uttrakhand" required /></label>
                <label className={styles.fullWidth}>Current Status*<span className={styles.selectWrap}><select name="status" defaultValue="" required>
                  <option value="" disabled>Select your current status</option>
                  <option>Salaried</option><option>Self-employed</option><option>Business owner</option><option>Student</option><option>Other</option>
                </select><ChevronLeft /></span></label>
              </div>
              <button className={styles.continueButton} type="submit">Continue<ArrowUp /></button>
            </form>
          </div>
        </div>
      </div>
    </section>
    {showOwners && <section className={styles.owners} id="project-property-owners" aria-labelledby="project-owners-heading">
      <div className={styles.ownerStage}>
      <div className={styles.ownerInner}>
          <Badge>FOR PROPERTY OWNERS &amp; DEVELOPERS</Badge>
          <h2 id="project-owners-heading">Have a space to lease?</h2>
          <p>Own or manage a commercial property? Get it in front of<br /> businesses actively searching on PropMentors.</p>
          <button className={styles.listButton} type="button" onClick={() => listingDialog.current?.showModal()}>List Your Space<ChevronLeft /></button>
      </div>
      </div>
    </section>}
    <dialog className="hero-dialog" ref={reviewDialog} aria-labelledby="requirement-review-heading" onClick={(event) => { if (event.target === event.currentTarget) reviewDialog.current?.close(); }}>
      <div className="dialog-content">
        <button type="button" className="dialog-close" aria-label="Close requirement review" onClick={() => reviewDialog.current?.close()}>×</button>
        <p className="dialog-eyebrow">PROPMENTORS</p>
        <h2 id="requirement-review-heading">Review your requirement</h2>
        {requirement && <dl className={styles.review}>{Object.entries(requirement).map(([key, value]) => <div key={key}><dt>{requirementLabels[key as keyof Requirement]}</dt><dd>{value}</dd></div>)}</dl>}
        <div className={styles.reviewActions}>
          <button type="button" className="dialog-primary" onClick={() => void copyRequirement()}>Copy requirement</button>
          <a href={`mailto:hello@propmentors.in?subject=${encodeURIComponent("Workspace requirement")}&body=${encodeURIComponent(draft)}`}>Share by email</a>
        </div>
        <p className="copy-status" role="status">{shareStatus}</p>
      </div>
    </dialog>
    <PropertyListingDialog dialogRef={listingDialog} headingId="project-owner-listing-heading" />
  </div>;
}
