"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContactDetails } from "@/lib/admin-types";
import { AdminIcon } from "./admin-icons";
import { adminRequest } from "./admin-request";

export function ContactEditor({ details }: { details: ContactDetails }) {
  const router = useRouter();
  const [value, setValue] = useState(details);
  const [saved, setSaved] = useState(details);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);
  function update(key: keyof ContactDetails, text: string) { setValue({ ...value, [key]: text }); setMessage(""); }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await adminRequest("/api/admin/contact", "PUT", value); setSaved(value); setError(false); setMessage("Your contact page has been updated."); router.refresh(); }
    catch (error) { setError(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <><div className="admin-page-heading"><div><span className="admin-eyebrow">MAKE IT EASY TO CONNECT</span><h1>Contact settings<span className="admin-heading-dot">.</span></h1><p>The details that turn a first hello into a conversation.</p></div><Link href="/contact" target="_blank" rel="noopener noreferrer" className="admin-button admin-button-secondary">View contact page<AdminIcon name="external" /></Link></div>
    <form onSubmit={save} className="admin-contact-layout"><div className="admin-form-stack"><section className="admin-card admin-form-card"><div className="admin-form-section-heading"><span><AdminIcon name="phone" /></span><div><h2>Business contact details</h2><p>Used on your contact page and in the website footer.</p></div></div><div className="admin-form"><div className="admin-form-grid"><label>Phone number<input aria-label="Phone number" type="tel" value={value.phone} required maxLength={40} onChange={(e) => update("phone", e.target.value)} /></label><label>Email address<input aria-label="Email address" type="email" value={value.email} required maxLength={254} onChange={(e) => update("email", e.target.value)} /></label></div><label>Office address<textarea aria-label="Office address" rows={3} value={value.address} required maxLength={1000} onChange={(e) => update("address", e.target.value)} /><small>Use a new line to separate the building and city.</small></label></div></section>
      <section className="admin-card admin-form-card"><div className="admin-form-section-heading"><span><AdminIcon name="draft" /></span><div><h2>A thoughtful first impression</h2><p>Set the tone for your contact page.</p></div></div><div className="admin-form"><label>Page heading<textarea aria-label="Page heading" rows={2} value={value.heading} required maxLength={160} onChange={(e) => update("heading", e.target.value)} /></label><label>Introduction<textarea aria-label="Introduction" rows={4} value={value.introduction} required maxLength={2000} onChange={(e) => update("introduction", e.target.value)} /></label></div></section>
      {message && <p role={error ? "alert" : "status"} className={`admin-alert ${error ? "admin-alert-error" : "admin-alert-success"}`}>{message}</p>}<div className="admin-save-bar"><span><i className={dirty ? "is-dirty" : ""} />{dirty ? "You have unsaved changes" : "All changes saved"}</span><button type="submit" disabled={busy || !dirty} className="admin-button admin-button-primary"><AdminIcon name="check" />{busy ? "Saving…" : "Save changes"}</button></div></div>
      <aside className="admin-contact-preview"><span className="admin-eyebrow">A PREVIEW OF YOUR DETAILS</span><div><span className="admin-preview-star">✳</span><h2 style={{ whiteSpace: "pre-line" }}>{value.heading}</h2><p>{value.introduction}</p><dl><div><dt><AdminIcon name="phone" />CALL US</dt><dd>{value.phone}</dd></div><div><dt><AdminIcon name="mail" />WRITE TO US</dt><dd>{value.email}</dd></div><div><dt><AdminIcon name="pin" />FIND US</dt><dd style={{ whiteSpace: "pre-line" }}>{value.address}</dd></div></dl></div><small>This preview updates as you type. Save to publish your changes.</small></aside>
    </form></>;
}
