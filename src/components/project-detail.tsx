"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft } from "./icons";
import { ProjectHeader } from "./project-header";
import { ProjectEnquiries } from "./project-enquiries";
import { PropertyCard } from "./property-card";
import { getProject, type Project, type ProjectImage, type ProjectFact } from "../data/projects";
import { RealGuidance } from "./real-guidance";
import { SiteFooter } from "./site-footer";
import styles from "./project-detail.module.css";

const galleryTabs = ["FLOOR PLAN", "INTERIOR", "EXTERIOR"] as const;

function Facts({ items }: { items: ProjectFact[] }) {
  return <dl className={styles.facts}>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function SpacePhoto({ image, priority = false }: { image: ProjectImage; priority?: boolean }) {
  return <Image src={image.src} data-space-id={image.id} alt={image.alt} width={image.width} height={image.height} unoptimized priority={priority} />;
}

export function ProjectDetail({ project }: { project: Project }) {
  const detail = project.detail;
  const gallery = detail.gallery.length ? detail.gallery : [project.cover];
  const similarProjects = detail.similarProjectIds.map(getProject).filter((item): item is Project => Boolean(item) && item?.id !== project.id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof galleryTabs)[number]>("FLOOR PLAN");
  const [request, setRequest] = useState("Schedule a visit");
  const [shareStatus, setShareStatus] = useState("");
  const [draft, setDraft] = useState("");
  const enquiry = useRef<HTMLDialogElement>(null);
  const lightbox = useRef<HTMLDialogElement>(null);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function openEnquiry(action = "Schedule a visit") {
    setRequest(action);
    setDraft("");
    setShareStatus("");
    enquiry.current?.showModal();
  }

  async function prepareEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = `${request}\nProperty: ${project.name}\nLocation: ${project.locationLabel}\nReference: ${project.id}\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nMobile: ${data.get("mobile")}\nPreferred visit date: ${data.get("date") || "To be arranged"}\nRequirements: ${data.get("requirements") || "Please contact me with more details."}`;
    setDraft(text);
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Your enquiry is copied and ready to share.");
    } catch {
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-property-enquiry.txt";
      link.click();
      URL.revokeObjectURL(url);
      setShareStatus("Your enquiry is downloaded and ready to share.");
    }
  }

  const visual = activeTab === "INTERIOR" ? detail.views.interior : activeTab === "EXTERIOR" ? detail.views.exterior : detail.views.floorPlan ?? project.cover;

  return <>
    <main className={styles.page}>
      <ProjectHeader onSearch={() => scrollTo("detail-spaces")} onContact={() => openEnquiry("Property enquiry")} />
      <div className={styles.container}>
        <section className={styles.gallery} aria-label="Property photographs">
          <button type="button" className={styles.mainPhoto} onClick={() => lightbox.current?.showModal()} aria-label="Open property photo gallery"><SpacePhoto image={gallery[activePhoto]} priority /><span className={styles.photoCount}>View photos <span aria-hidden="true">↗</span></span></button>
          <div className={styles.thumbnails}>{gallery.slice(1).map((item, index) => <button key={item.id} type="button" onClick={() => setActivePhoto(index + 1)} aria-label={`Show property photo ${index + 2}`} aria-pressed={activePhoto === index + 1}><SpacePhoto image={item} /></button>)}</div>
        </section>
        <div className={styles.titleRow}>
          <div><nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/projects">Spaces</Link><span>/</span><span>{project.name}</span></nav><h1>{project.name}</h1><p>{project.locationLabel}</p></div>
          <button type="button" className={styles.primary} onClick={() => openEnquiry("Request a brochure")}>Request Brochure <ChevronLeft /></button>
        </div>
        <nav className={styles.sectionNav} aria-label="Property sections">
          <a href="#detail-overview">Overview</a><a href="#detail-amenities">Amenities</a><a href="#detail-location">Location</a><a href="#detail-explore">Floor Plan</a>
          <button type="button" className={styles.primary} onClick={() => openEnquiry()}>Schedule Visit</button>
        </nav>
        <div className={styles.detailLayout}>
          <div className={styles.content}>
            <section className={styles.overview} id="detail-overview" aria-labelledby="overview-heading">
              <h2 id="overview-heading">{project.name}</h2><p>{detail.description}</p>
              <h3>Overview</h3><Facts items={detail.overview} />
            </section>
            <section className={styles.detailSection} id="detail-spaces" aria-labelledby="team-heading">
              <h2 id="team-heading">Find the space that<br /> fits your team</h2><p>{detail.description}</p>
              <div className={styles.teamGrid}>{detail.spaces.map((item) => <article className={styles.teamCard} key={item.id}>
                <div className={styles.teamPhoto}><SpacePhoto image={item.image} /><div className={styles.smallBadges}><span>{project.category.toUpperCase()}</span><span>{item.badge.toUpperCase()}</span></div></div>
                <h3>{item.title}</h3><p>{item.location}</p><p>{item.description}</p>
                <button type="button" className={styles.primary} onClick={() => openEnquiry(`Workspace enquiry — ${item.title}`)}>Enquire <ChevronLeft /></button>
              </article>)}</div>
            </section>
            <section className={styles.detailSection} aria-labelledby="building-heading">
              <h2 id="building-heading">Building<br /> Information</h2><p>{detail.description}</p><Facts items={detail.building} />
            </section>
            <section className={styles.detailSection} id="detail-amenities" aria-labelledby="amenities-heading">
              <h2 id="amenities-heading">Amenities</h2><p>{detail.description}</p>
              <ul className={styles.amenities}>{detail.amenities.map((item, index) => <li key={item}><span aria-hidden="true"><AmenityIcon index={index} /></span>{item}</li>)}</ul>
            </section>
            <section className={styles.detailSection} id="detail-location" aria-labelledby="location-heading">
              <h2 id="location-heading">Location</h2>
              <div className={styles.locationRow}><p>{detail.location.caption}</p><a className={styles.primary} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.location.directionsQuery)}`} target="_blank" rel="noopener noreferrer">Get Directions <ChevronLeft /></a></div>
              <div className={styles.map}><Image src={detail.location.map.src} alt={detail.location.map.alt} width={detail.location.map.width} height={detail.location.map.height} unoptimized /></div><Facts items={detail.location.nearby} />
            </section>
            <section className={styles.detailSection} id="detail-explore" aria-labelledby="explore-heading">
              <h2 id="explore-heading">Explore the Space</h2>
              <div className={styles.tabs} role="tablist" aria-label="Space views">{galleryTabs.map((tab) => <button type="button" role="tab" key={tab} id={`space-tab-${tab.replaceAll(" ", "-").toLowerCase()}`} aria-selected={activeTab === tab} aria-controls="space-view" onClick={() => setActiveTab(tab)} onKeyDown={(event) => {
                const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!direction && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? galleryTabs.length - 1 : (galleryTabs.indexOf(tab) + direction + galleryTabs.length) % galleryTabs.length;
                setActiveTab(galleryTabs[next]);
                (event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
              }} tabIndex={activeTab === tab ? 0 : -1}>{tab}</button>)}</div>
              <div className={styles.spaceView} role="tabpanel" id="space-view" aria-labelledby={`space-tab-${activeTab.replaceAll(" ", "-").toLowerCase()}`} tabIndex={0}><SpacePhoto image={visual} />{activeTab === "FLOOR PLAN" && !detail.views.floorPlan && <span className={styles.planNote}>Floor plan available on request</span>}</div>
              <p className={styles.exploreCaption}>{detail.location.caption}</p>
            </section>
          </div>
          <aside className={styles.enquiryCard} aria-labelledby="space-enquiry-heading">
            <h2 id="space-enquiry-heading">Interested in this space?</h2><p>Let’s help you find the right workspace for your business.</p>
            <span className={styles.starting}>STARTING FROM</span><p className={styles.rent}>{detail.startingPrice}<span> {detail.startingPriceUnit}</span></p>
            <ul>{detail.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            <button type="button" className={styles.primary} onClick={() => openEnquiry()}>Request for Visit <ChevronLeft /></button>
            <div className={styles.similarPrompt}><h3>Not quite what you’re looking for?</h3><p>We’ll help you find a space that fits your business.</p><button type="button" className={styles.outline} onClick={() => scrollTo("similar-spaces")}>Find Similar Spaces <ChevronLeft /></button></div>
          </aside>
        </div>
      </div>
      <div className={styles.reasons}><RealGuidance id="space-benefits" showBadge={false} heading="Why businesses choose this space" introduction="Complete the process with practical advice, relevant options and hands-on support." cards={detail.benefits} /></div>
      <section className={styles.similar} id="similar-spaces" aria-labelledby="similar-heading">
        <div className={styles.similarHeading}><h2 id="similar-heading">Looking for something<br /> similar?</h2><p>Complete the process with practical advice, relevant options and hands-on support.</p></div>
        <div className={styles.similarGrid}>{similarProjects.map((item) => <PropertyCard key={item.id} property={item} />)}</div>
      </section>
      <ProjectEnquiries showOwners={false} />
    </main>
    <SiteFooter homePath="/" />
    <dialog className="hero-dialog" ref={enquiry} aria-labelledby="detail-enquiry-heading" onClose={() => { setDraft(""); setShareStatus(""); }} onClick={(event) => { if (event.target === event.currentTarget) enquiry.current?.close(); }}>
      <div className="dialog-content">
        <button type="button" className="dialog-close" aria-label="Close property enquiry" onClick={() => enquiry.current?.close()}>×</button><p className="dialog-eyebrow">{project.name} · {project.locationLabel}</p><h2 id="detail-enquiry-heading">{request}</h2>
        <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void prepareEnquiry(event.currentTarget); }}>
          <label>Your name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Mobile number<input name="mobile" type="tel" autoComplete="tel" required /></label>
          <label>Preferred visit date<input name="date" type="date" /></label><label>Tell us what you need<textarea name="requirements" rows={2} placeholder="Team size, preferred workspace and move-in date" /></label>
          <p className="form-note">Prepare your enquiry to share with PropMentors. Availability and visits are confirmed by the team.</p><button type="submit" className="dialog-primary">Copy enquiry</button>
          {draft && <a className={styles.email} href={`mailto:hello@propmentors.in?subject=${encodeURIComponent(`${request} — ${project.name}`)}&body=${encodeURIComponent(draft)}`}>Share by email</a>}<p className="copy-status" role="status">{shareStatus}</p>
        </form>
      </div>
    </dialog>
    <dialog className={styles.lightbox} ref={lightbox} aria-label="Property photo gallery" onClick={(event) => { if (event.target === event.currentTarget) lightbox.current?.close(); }}>
      <div className={styles.lightboxContent}><button type="button" className={styles.lightboxClose} aria-label="Close photo gallery" onClick={() => lightbox.current?.close()}>×</button><SpacePhoto image={gallery[activePhoto]} /><div className={styles.lightboxControls}><button type="button" aria-label="Previous photo" onClick={() => setActivePhoto((activePhoto + gallery.length - 1) % gallery.length)}><ChevronLeft /></button><span>{activePhoto + 1} / {gallery.length}</span><button type="button" aria-label="Next photo" onClick={() => setActivePhoto((activePhoto + 1) % gallery.length)}><ChevronLeft /></button></div></div>
    </dialog>
  </>;
}

function AmenityIcon({ index }: { index: number }) {
  const paths = ["m13 2-8 11h6l-1 9 9-12h-6l1-8Z", "M3 9c5-5 13-5 18 0M6 12c3-3 9-3 12 0M9 15c2-1 4-1 6 0M12 19h.01", "M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3", "m12 3 8 4v6c0 4-5 7-8 9-3-2-8-5-8-9V7l8-4Zm-4 9 3 3 5-6", "M4 21V4h16v17M9 21V7h6v14M12 12h1", "M6 21V3h8a5 5 0 0 1 0 10H6M10 7h4a1 1 0 0 1 0 2h-4", "M4 21v-8h16v8M2 21h20M8 9a4 4 0 1 1 8 0M12 9v4", "M4 3h16v18H4V3Zm4 7 2-3 2 3m0 4 2 3 2-3"];
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[index % paths.length]} /></svg>;
}
