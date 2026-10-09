"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AccountCircle, ArrowUp, ChevronLeft, Search } from "./icons";
import { useHeroExpansion } from "@/hooks/use-hero-expansion";

const workspaces = [
  { name: "Managed Offices", label: "MANAGED OFFICES", description: "Fully managed workspaces, ready for your business." },
  { name: "Co-Working", label: "CO-WORKING", description: "Flexible spaces for teams that want room to grow." },
  { name: "Conventional", label: "CONVENTIONAL LEASING", description: "Dedicated spaces with greater control and flexibility." },
];
type Panel = "spaces" | "contact";

export function Hero() {
  const { trackRef, pinRef, heroRef, photoRef } = useHeroExpansion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel>("spaces");
  const [query, setQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState("");
  const [copied, setCopied] = useState(false);

  function openPanel(next: Panel, selected = "") {
    setPanel(next);
    setSelectedSpace(selected);
    setCopied(false);
    setQuery("");
    dialog.current?.showModal();
  }

  async function copyEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const enquiry = `Workspace enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nWorkspace: ${data.get("workspace")}\nRequirements: ${data.get("requirements")}`;
    try { await navigator.clipboard.writeText(enquiry); setCopied(true); }
    catch {
      const url = URL.createObjectURL(new Blob([enquiry], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-enquiry.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  return <>
    <div className="hero-scroll-track" ref={trackRef} id="home">
    <div className="hero-pin" ref={pinRef}>
    <section className="hero" ref={heroRef} aria-labelledby="hero-heading" data-node-id="331:1748">
      <div className="hero-photo" ref={photoRef} aria-hidden="true"><Image src="/images/hero-office.png" alt="" width={2618} height={1744} preload unoptimized /></div>
      <div className="hero-top-shade" aria-hidden="true" />
      <header className="hero-header">
        <a className="brand" href="#home" aria-label="PropMentors home"><Image src="/images/propmentors-logo.svg" alt="PropMentors" width={43} height={48.2339} unoptimized /></a>
        <div className="header-links">
          <nav className="primary-nav" aria-label="Main navigation">
            <Link href="/" aria-current="page">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/list-your-space">List Your Space</Link>
            <Link href="/projects">Projects</Link>
          </nav>
          <div className="header-actions">
            <Link href="/projects" className="icon-button search-button" aria-label="Search workspaces"><Search /></Link>
            <Link href="/projects" className="contact-button">Contact</Link>
            <Link href="/projects" className="icon-button account-button" aria-label="Your workspace enquiry"><AccountCircle /></Link>
          </div>
        </div>
      </header>
      <div className="workspace-nav">{workspaces.map((space) => <span key={space.name}>{space.label}</span>)}</div>
      <h1 className="hero-title" id="hero-heading">The right space</h1>
      <p className="hero-tagline">can change everything</p>
      <div className="hero-intro">
        <p>Find commercial spaces that fit your business, your team and the way you work — with PropMentors by your side.</p>
        <div className="find-space-label">Find My Space <ChevronLeft /></div>
      </div>
      <div className="workspace-overview" id="workspaces">{workspaces.map((space, index) => <div key={space.name} className="workspace-card">
        <span className="workspace-card-heading"><span className="workspace-number">{index + 1}</span><span>{space.name}</span></span>
        <span className="workspace-description">{space.description}</span>
      </div>)}</div>
      <div className="hero-scroll" aria-hidden="true"><ArrowUp /></div>
    </section>
    </div>
    </div>
    <dialog className="hero-dialog" ref={dialog} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-labelledby="dialog-title">
      <div className="dialog-content">
        <button className="dialog-close" aria-label="Close dialog" onClick={() => dialog.current?.close()}>×</button>
        <p className="dialog-eyebrow">PROPMENTORS</p>
        <h2 id="dialog-title">{panel === "contact" ? "Let’s find your space" : "Three ways to work"}</h2>
        {panel === "spaces" ? <>
          <label className="workspace-search"><Search /><input type="search" aria-label="Filter workspace types" placeholder="Search workspace types" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="dialog-spaces">
            {workspaces.filter((space) => `${space.name} ${space.description}`.toLowerCase().includes(query.toLowerCase())).map((space) => <button className={`dialog-space${selectedSpace === space.name ? " selected" : ""}`} key={space.name} onClick={() => openPanel("contact", space.name)}><strong>{space.name}</strong><span>{space.description}</span><span className="space-enquire">Prepare an enquiry →</span></button>)}
            {!workspaces.some((space) => `${space.name} ${space.description}`.toLowerCase().includes(query.toLowerCase())) && <p>No workspace types match “{query}”. Try “managed” or “co-working”.</p>}
          </div>
        </> : <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void copyEnquiry(event.currentTarget); }}>
          <label>Your name<input name="name" autoComplete="name" required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Workspace type<select name="workspace" defaultValue={selectedSpace || workspaces[0].name}>{workspaces.map((space) => <option key={space.name}>{space.name}</option>)}</select></label>
          <label>What does your team need?<textarea name="requirements" placeholder="Preferred city, team size and move-in date" rows={3} required /></label>
          <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p>
          <button className="dialog-primary" type="submit">{copied ? "Enquiry copied" : "Copy enquiry"}</button>
          <p role="status" className="copy-status">{copied ? "Your enquiry is ready to paste and share." : ""}</p>
        </form>}
      </div>
    </dialog>
  </>;
}
