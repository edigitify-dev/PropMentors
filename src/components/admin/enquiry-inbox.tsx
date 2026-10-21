"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Enquiry, EnquiryStatus } from "@/lib/admin-types";
import { AdminIcon } from "./admin-icons";
import { adminRequest } from "./admin-request";

const date = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(value));
export function EnquiryInbox({ enquiries, selectedId }: { enquiries: Enquiry[]; selectedId?: string }) {
  const [items, setItems] = useState(enquiries);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | EnquiryStatus>("all");
  const [selected, setSelected] = useState(selectedId || enquiries[0]?.id || "");
  const filtered = items.filter((item) => (status === "all" || item.status === status) && `${item.name} ${item.email} ${item.subject} ${item.projectName || ""}`.toLowerCase().includes(search.toLowerCase()));
  const current = filtered.find((item) => item.id === selected) || filtered[0];
  function exportCsv() {
    const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const rows = [["Name", "Email", "Phone", "Subject", "Message", "Project", "Status", "Notes", "Received"], ...filtered.map((item) => [item.name, item.email, item.phone, item.subject, item.message, item.projectName || "", item.status, item.notes, item.createdAt])];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "propmentors-enquiries.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <><div className="admin-page-heading"><div><span className="admin-eyebrow">EVERY CONVERSATION MATTERS</span><h1>Your enquiries<span className="admin-heading-dot">.</span></h1><p>A considered place to follow up, keep notes, and move things forward.</p></div><button className="admin-button admin-button-secondary" disabled={!filtered.length} onClick={exportCsv}><AdminIcon name="upload" />Export enquiries</button></div>
    <section className="admin-card"><div className="admin-tabs">{(["all", "new", "contacted", "closed"] as const).map((value) => <button key={value} aria-pressed={status === value} className={status === value ? "is-active" : ""} onClick={() => setStatus(value)}>{value === "all" ? "All enquiries" : value === "new" ? "New" : value === "contacted" ? "Contacted" : "Closed"}<span>{items.filter((item) => value === "all" || item.status === value).length}</span></button>)}</div>
      <div className="admin-inbox"><div className="admin-inbox-list"><label className="admin-search"><AdminIcon name="search" /><input aria-label="Search enquiries" placeholder="Search conversations…" value={search} onChange={(e) => setSearch(e.target.value)} /></label><div className="admin-inbox-scroll">{filtered.map((item) => <button key={item.id} className={`admin-inbox-item ${current?.id === item.id ? "is-selected" : ""}`} onClick={() => setSelected(item.id)}><span className="admin-enquiry-avatar">{item.name.charAt(0).toUpperCase()}</span><span><strong>{item.name}</strong><b>{item.subject}</b><small>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(item.createdAt))} · {item.source}</small></span>{item.status === "new" && <i />}</button>)}{!filtered.length && <p className="admin-inline-empty">No enquiries match your search.</p>}</div></div>
      {current ? <EnquiryDetail key={current.id} enquiry={current} onSave={(updated) => setItems((items) => items.map((item) => item.id === updated.id ? updated : item))} /> : <div className="admin-empty admin-inbox-empty"><span><AdminIcon name="inbox" /></span><h3>A space for your next hello</h3><p>New website enquiries will appear here, ready for a thoughtful response.</p><Link className="admin-button admin-button-secondary" href="/contact" target="_blank" rel="noopener noreferrer">View contact page <AdminIcon name="external" /></Link></div>}
      </div></section></>;
}

function EnquiryDetail({ enquiry, onSave }: { enquiry: Enquiry; onSave: (enquiry: Enquiry) => void }) {
  const router = useRouter();
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function save() {
    setBusy(true); setMessage("");
    try { await adminRequest(`/api/admin/enquiries/${enquiry.id}`, "PATCH", { status, notes }); onSave({ ...enquiry, status, notes }); setError(false); setMessage("Enquiry updated."); router.refresh(); }
    catch (error) { setError(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <article className="admin-enquiry-detail"><div className="admin-enquiry-detail-header"><span className={`admin-status ${enquiry.status}`}>{enquiry.status}</span><span>{date(enquiry.createdAt)} IST</span></div><h2>{enquiry.subject}</h2><div className="admin-enquiry-sender"><span className="admin-enquiry-avatar">{enquiry.name.charAt(0).toUpperCase()}</span><div><strong>{enquiry.name}</strong><span>Sent from {enquiry.source === "project" ? "a project page" : enquiry.source === "contact" ? "the contact page" : enquiry.source === "requirement" ? "workspace requirements" : `the ${enquiry.source}`}</span></div></div><div className="admin-enquiry-contact"><a href={`mailto:${enquiry.email}`}><AdminIcon name="mail" />{enquiry.email}</a><a href={`tel:${enquiry.phone.replace(/[^+\d]/g, "")}`}><AdminIcon name="phone" />{enquiry.phone}</a></div>{enquiry.projectName && <Link className="admin-enquiry-property" href={`/admin/projects/${encodeURIComponent(enquiry.projectId!)}`}><AdminIcon name="building" /><span>Interested in <strong>{enquiry.projectName}</strong></span><AdminIcon name="chevron" /></Link>}<div className="admin-enquiry-message">{enquiry.message}</div>
    <div className="admin-enquiry-followup"><h3>Keep the conversation moving</h3><div className="admin-form"><label>Enquiry status<select value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus)}><option value="new">New — needs a response</option><option value="contacted">Contacted — conversation started</option><option value="closed">Closed — all taken care of</option></select></label><label>Internal notes<textarea aria-label="Internal notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} placeholder="Visit plans, preferences, or a reminder for the next conversation…" /><small>Only your admin team can see these notes.</small></label></div><div className="admin-enquiry-actions"><a className="admin-button admin-button-secondary" href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.subject}`)}`}><AdminIcon name="mail" />Reply by email</a><button disabled={busy || status === enquiry.status && notes === enquiry.notes} className="admin-button admin-button-primary" onClick={save}>{busy ? "Saving…" : "Save update"}<AdminIcon name="check" /></button></div>{message && <p role={error ? "alert" : "status"} className={`admin-alert ${error ? "admin-alert-error" : "admin-alert-success"}`}>{message}</p>}</div>
  </article>;
}
