"use client";

import { useState, type RefObject } from "react";

export function PropertyListingDialog({ dialogRef, headingId = "owner-listing-title" }: { dialogRef: RefObject<HTMLDialogElement | null>; headingId?: string }) {
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
    <dialog className="hero-dialog" ref={dialogRef} onClose={() => { setCopied(false); setDownloaded(false); }} aria-labelledby={headingId} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="dialog-content">
        <button className="dialog-close" aria-label="Close listing draft" onClick={() => dialogRef.current?.close()}>×</button>
        <p className="dialog-eyebrow">PROPMENTORS</p>
        <h2 id={headingId}>List your space</h2>
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
  );
}
