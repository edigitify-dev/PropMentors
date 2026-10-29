"use client";

import Image from "@/components/storage-image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "./icons";
import { ProjectHeader } from "./project-header";
import { ProjectEnquiries } from "./project-enquiries";
import { PropertyCard } from "./property-card";
import { formatProjectPrice, type Project, type ProjectImage, type ProjectFact } from "@/lib/project-types";
import { SiteFooter } from "./site-footer";
import { ProjectMap } from "./project-map";
import styles from "./project-detail.module.css";
import { submitEnquiry } from "@/lib/submit-enquiry";
import { useContactDetails } from "./contact-provider";

type GalleryTab = "FLOOR PLAN" | "INTERIOR" | "EXTERIOR" | "PHOTOS";
const defaultGalleryTabs: GalleryTab[] = ["FLOOR PLAN", "INTERIOR", "EXTERIOR"];
const workspaceFormats = [
  { pattern: /conventional/i, title: "Conventional Office", badge: "Conventional", range: "From 1,000 to 20,000 SQ.FT." },
  { pattern: /managed|commercial/i, title: "Managed Spaces", badge: "Managed", range: "From 1,000 to 20,000 SQ.FT." },
  { pattern: /co[\s-]?working/i, title: "Co-working spaces", badge: "Co-working", range: "From 5 seats to 200 seats" },
];
const propertySections = [
  { id: "detail-overview", label: "Overview" },
  { id: "detail-building", label: "Building" },
  { id: "detail-amenities", label: "Amenities" },
  { id: "detail-location", label: "Location" },
  { id: "detail-explore", label: "Explore the Space" },
] as const;
type PropertySection = (typeof propertySections)[number]["id"];

function Facts({ items }: { items: ProjectFact[] }) {
  return <dl className={styles.facts}>{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

function SpacePhoto({ image, preload = false }: { image: ProjectImage; preload?: boolean }) {
  return <Image src={image.src} data-space-id={image.id} alt={image.alt} width={image.width} height={image.height} unoptimized preload={preload} />;
}

export function ProjectDetail({ project, similarProjects, listingHref = "/projects" }: { project: Project; similarProjects: Project[]; listingHref?: string }) {
  const detail = project.detail;
  const gallery = detail.gallery.length ? detail.gallery : [project.cover];
  const galleryTabs: GalleryTab[] = detail.photoViewsOnly ? ["PHOTOS", "FLOOR PLAN"] : defaultGalleryTabs;
  const [activePhoto, setActivePhoto] = useState(0);
  const [previewPhotos, setPreviewPhotos] = useState(gallery);
  const [activeSection, setActiveSection] = useState<PropertySection>("detail-overview");
  const [activeTab, setActiveTab] = useState<GalleryTab>(detail.photoViewsOnly ? "PHOTOS" : "FLOOR PLAN");
  const [request, setRequest] = useState("Schedule a visit");
  const [shareStatus, setShareStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const contact = useContactDetails();
  const enquiry = useRef<HTMLDialogElement>(null);
  const lightbox = useRef<HTMLDialogElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const sectionNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const navigation = sectionNavRef.current;
    if (!page || !navigation) return;

    let frame = 0;
    let hashFrame = 0;
    let disposed = false;

    function updateActiveSection() {
      frame = 0;
      const threshold = navigation!.getBoundingClientRect().height + 26;
      let current: PropertySection = "detail-overview";
      for (const section of propertySections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= threshold) current = section.id;
      }
      setActiveSection(current);
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    }

    function measureNavigation() {
      page!.style.setProperty("--property-section-nav-height", `${navigation!.getBoundingClientRect().height}px`);
      scheduleUpdate();
    }

    function restoreSection() {
      window.cancelAnimationFrame(hashFrame);
      hashFrame = window.requestAnimationFrame(() => {
        measureNavigation();
        const section = propertySections.find((item) => `#${item.id}` === window.location.hash);
        if (section) {
          document.getElementById(section.id)?.scrollIntoView({ block: "start", behavior: "instant" });
        } else if (window.location.hash === "#share-requirement") {
          document.getElementById("share-requirement")?.scrollIntoView({ block: "start", behavior: "instant" });
        }
      });
    }

    measureNavigation();
    void document.fonts.ready.then(() => {
      if (!disposed) restoreSection();
    });
    const observer = new ResizeObserver(measureNavigation);
    observer.observe(navigation);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", measureNavigation);
    window.addEventListener("hashchange", restoreSection);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(hashFrame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", measureNavigation);
      window.removeEventListener("hashchange", restoreSection);
      page.style.removeProperty("--property-section-nav-height");
    };
  }, [project.id]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function openEnquiry(action = "Schedule a visit") {
    setRequest(action);
    setDraft("");
    setShareStatus("");
    enquiry.current?.showModal();
  }

  function openPhoto(image = gallery[0]) {
    const index = gallery.findIndex((photo) => photo.src === image.src);
    setPreviewPhotos(index === -1 ? [image] : gallery);
    setActivePhoto(Math.max(0, index));
    lightbox.current?.showModal();
  }

  async function prepareEnquiry(form: HTMLFormElement) {
    if (sending) return;
    const data = new FormData(form);
    const text = `${request}\nProperty: ${project.name}\nLocation: ${project.locationLabel}\nReference: ${project.id}\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nMobile: ${data.get("mobile")}\nPreferred visit date: ${data.get("date") || "To be arranged"}\nRequirements: ${data.get("requirements") || "Please contact me with more details."}`;
    setSending(true); setShareStatus("");
    try {
      await submitEnquiry({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("mobile")), subject: `${request} — ${project.name}`.slice(0, 180), message: text, source: "project", projectId: project.id });
      setDraft(text); setShareStatus("Your enquiry has been received. Our team will contact you to confirm the details.");
      form.reset();
    } catch (error) { setShareStatus((error as Error).message); }
    finally { setSending(false); }
  }

  const visual = activeTab === "INTERIOR" ? detail.views.interior : activeTab === "EXTERIOR" ? detail.views.exterior : activeTab === "PHOTOS" ? gallery[0] : detail.views.floorPlan ?? gallery[0];

  return <>
    <main className={styles.page} ref={pageRef}>
      <ProjectHeader spacesHref={listingHref} revealOnScrollUp={false} onContact={() => openEnquiry("Property enquiry")} />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span><Link href={listingHref}>Spaces</Link><span>/</span><span>{project.name}</span>
        </nav>
        <div className={styles.titleRow}>
          <div>
            <span className={styles.eyebrow}>{project.category} · {project.spaceType ?? "Office space"}</span>
            <h1>{project.name}</h1>
            <p className={styles.address}><LocationPin />{project.locationLabel}</p>
          </div>
        </div>

        <section className={`${styles.gallery} ${gallery.length === 1 ? styles.singlePhoto : ""}`} aria-label="Property photographs">
          <div className={styles.mainPhotoWrap}>
            <button type="button" className={styles.mainPhoto} onClick={() => openPhoto()} aria-label="Open property photo gallery">
              <SpacePhoto image={gallery[0]} preload />
            </button>
            <span className={styles.photoCount}>01 / {String(gallery.length).padStart(2, "0")}</span>
            <button type="button" className={styles.viewAllPhotos} onClick={() => openPhoto()}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="12" y="2" width="6" height="6" rx="1" /><rect x="2" y="12" width="6" height="6" rx="1" /><rect x="12" y="12" width="6" height="6" rx="1" /></svg>
              View All Photos <span>{gallery.length}</span>
            </button>
          </div>
          {gallery.length > 1 && <div className={styles.thumbnails}>
            {gallery.slice(1, 3).map((item, index) => <button key={item.id} type="button" onClick={() => openPhoto(item)} aria-label={`Open property photo ${index + 2} at full size`}>
              <SpacePhoto image={item} />
            </button>)}
          </div>}
        </section>

        <nav className={styles.sectionNav} ref={sectionNavRef} aria-label="Property sections">
          <div className={styles.sectionNavLinks}>
            {propertySections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? "location" : undefined}>{section.label}</a>)}
          </div>
          <button type="button" className={styles.primary} onClick={() => openEnquiry()}>Schedule Visit</button>
        </nav>

        <div className={styles.detailLayout}>
          <div className={styles.content}>
            <div className={styles.information}>
              <section className={styles.infoPanel} id="detail-overview" aria-labelledby="overview-heading" tabIndex={-1}>
                <div className={styles.panelHeading}><h2 id="overview-heading">Overview</h2><span className={styles.eyebrow}>At a glance</span></div>
                <p className={styles.description}>{detail.description}</p>
                <Facts items={detail.overview} />
              </section>
              <section className={styles.spacesSection} id="detail-spaces" aria-labelledby="team-heading">
                <div className={styles.sectionHeading}><h2 id="team-heading">Find the space that fits your team</h2><span className={styles.eyebrow}>Workspace options</span></div>
                {!detail.spaces.length && <p>Contact our team for current availability, office configurations and leasing terms.</p>}
                <div className={styles.teamGrid}>{detail.spaces.map((item) => {
                  const format = workspaceFormats.find(({ pattern }) => pattern.test(`${item.title} ${item.badge}`));
                  const title = format?.title ?? item.title;
                  return <article className={styles.teamCard} key={item.id}>
                    <button type="button" className={`${styles.teamPhoto} ${styles.photoPreview}`} onClick={() => openPhoto(item.image)} aria-label={`View ${title} photo at full size`}><SpacePhoto image={item.image} /></button>
                    <div className={styles.teamBody}>
                      <span className={styles.spaceBadge}>{format?.badge ?? item.badge}</span>
                      <h3>{title}</h3><p className={styles.teamLocation}>{item.location}</p><p className={styles.teamDescription}>{format?.range ?? item.description}</p>
                      <button type="button" className={styles.textLink} onClick={() => openEnquiry(`Workspace enquiry — ${title}`)}>Enquire Now <ChevronRight /></button>
                    </div>
                  </article>;
                })}</div>
              </section>

              <section className={styles.infoPanel} id="detail-building" aria-labelledby="building-heading" tabIndex={-1}>
                <div className={styles.panelHeading}><h2 id="building-heading">Building information</h2><span className={styles.eyebrow}>The essentials</span></div>
                <dl className={styles.buildingTable}>
                  {detail.building.map(([label, value]) => <div key={label} className={styles.buildingRow}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
              </section>
              <section className={styles.infoPanel} id="detail-amenities" aria-labelledby="amenities-heading" tabIndex={-1}>
                <div className={styles.panelHeading}><h2 id="amenities-heading">Amenities</h2><span className={styles.eyebrow}>In the building</span></div>
                {!detail.amenities.length && <p className={styles.description}>Contact our team for building amenities and facilities.</p>}
                <ul className={styles.amenities}>{detail.amenities.map((item, index) => <li key={item}><span aria-hidden="true"><AmenityIcon index={index} /></span>{item}</li>)}</ul>
              </section>
              <section className={styles.infoPanel} id="detail-location" aria-labelledby="location-heading" tabIndex={-1}>
                <div className={styles.panelHeading}><h2 id="location-heading">Location</h2><a className={styles.textLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.location.directionsQuery)}`} target="_blank" rel="noopener noreferrer">Get Directions <ChevronRight /></a></div>
                <p className={styles.locationCaption}>{detail.location.caption}</p>
                <div className={styles.locationMap}><ProjectMap project={project} /></div>
              </section>
              <section className={styles.infoPanel} id="detail-explore" aria-labelledby="explore-heading" tabIndex={-1}>
                <div className={styles.panelHeading}><h2 id="explore-heading">Explore the Space</h2></div>
                <div className={styles.tabs} role="tablist" aria-label="Space views">{galleryTabs.map((tab) => <button type="button" role="tab" key={tab} id={`space-tab-${tab.replaceAll(" ", "-").toLowerCase()}`} aria-selected={activeTab === tab} aria-controls="space-view" onClick={() => setActiveTab(tab)} onKeyDown={(event) => {
                  const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                  if (!direction && event.key !== "Home" && event.key !== "End") return;
                  event.preventDefault();
                  const next = event.key === "Home" ? 0 : event.key === "End" ? galleryTabs.length - 1 : (galleryTabs.indexOf(tab) + direction + galleryTabs.length) % galleryTabs.length;
                  setActiveTab(galleryTabs[next]);
                  (event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
                }} tabIndex={activeTab === tab ? 0 : -1}>{tab}</button>)}</div>
                <div className={`${styles.spaceView} ${activeTab === "FLOOR PLAN" ? styles.floorPlan : ""}`} role="tabpanel" id="space-view" aria-labelledby={`space-tab-${activeTab.replaceAll(" ", "-").toLowerCase()}`} tabIndex={0}>
                  <button type="button" className={styles.photoPreview} onClick={() => openPhoto(visual)} aria-label={`View ${activeTab.toLowerCase()} image at full size`}><SpacePhoto image={visual} /></button>
                  {activeTab === "FLOOR PLAN" && !detail.views.floorPlan && <span className={styles.planNote}>Floor plan available on request</span>}
                </div>
                <p className={styles.exploreCaption}>{detail.location.caption}</p>
              </section>
            </div>
          </div>

          <aside className={styles.enquiryCard} aria-labelledby="space-enquiry-heading">
            <span className={styles.starting}>{project.price === null ? "RENT" : "STARTING FROM"}</span>
            <p className={styles.rent}>{formatProjectPrice(project.price)}</p>
            <div className={styles.enquiryIntro}><h2 id="space-enquiry-heading">Interested in this space?</h2><p>Let’s help you find the right workspace for your business.</p></div>
            <ul>{detail.highlights.map((highlight) => <li key={highlight}><span aria-hidden="true">✓</span>{highlight}</li>)}</ul>
            <button type="button" className={styles.primary} onClick={() => openEnquiry()}>Request for Visit <ChevronRight /></button>
            <div className={styles.similarPrompt}><h3>Not quite what you’re looking for?</h3><p>We’ll help you find a space that fits your business.</p><button type="button" className={styles.textLink} onClick={() => scrollTo("similar-spaces")}>Find Similar Spaces <ChevronRight /></button></div>
          </aside>
        </div>

        <section className={styles.similar} id="similar-spaces" aria-labelledby="similar-heading">
          <div className={styles.sectionHeading}><h2 id="similar-heading">Looking for something similar?</h2><Link href={listingHref} className={styles.textLink}>View all spaces <ChevronRight /></Link></div>
          <div className={styles.similarGrid}>{similarProjects.map((item) => <PropertyCard key={item.id} property={item} returnTo={listingHref} />)}</div>
        </section>
      </div>
      <ProjectEnquiries showOwners={false} />
    </main>
    <SiteFooter homePath="/" className={styles.footer} />
    <dialog className="hero-dialog" ref={enquiry} aria-labelledby="detail-enquiry-heading" onClose={() => { setDraft(""); setShareStatus(""); }} onClick={(event) => { if (event.target === event.currentTarget) enquiry.current?.close(); }}>
      <div className="dialog-content">
        <button type="button" className="dialog-close" aria-label="Close property enquiry" onClick={() => enquiry.current?.close()}>×</button><p className="dialog-eyebrow">{project.name} · {project.locationLabel}</p><h2 id="detail-enquiry-heading">{request}</h2>
        <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void prepareEnquiry(event.currentTarget); }}>
          <label>Your name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Mobile number<input name="mobile" type="tel" autoComplete="tel" required /></label>
          <label>Preferred visit date<input name="date" type="date" /></label><label>Tell us what you need<textarea name="requirements" rows={2} placeholder="Team size, preferred workspace and move-in date" /></label>
          <p className="form-note">Send your enquiry to PropMentors. Availability and visits are confirmed by the team.</p><button type="submit" className="dialog-primary" disabled={sending}>{sending ? "Sending…" : "Send enquiry"}</button>
          {draft && <a className={styles.email} href={`mailto:${contact.email}?subject=${encodeURIComponent(`${request} — ${project.name}`)}&body=${encodeURIComponent(draft)}`}>Also share by email</a>}<p className="copy-status" role="status">{shareStatus}</p>
        </form>
      </div>
    </dialog>
    <dialog className={styles.lightbox} ref={lightbox} aria-label="Property photo gallery" onClick={(event) => { if (event.target === event.currentTarget) lightbox.current?.close(); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setActivePhoto((current) => (current + (event.key === "ArrowLeft" ? -1 : 1) + previewPhotos.length) % previewPhotos.length);
      }
    }}>
      <header className={styles.lightboxHeader}>
        <div className={styles.lightboxTitle}><p>PROPERTY GALLERY</p><h2>{project.name}</h2></div>
        <div className={styles.lightboxActions}>
          <span className={styles.lightboxCount} aria-live="polite" aria-atomic="true">{String(activePhoto + 1).padStart(2, "0")} <span>/ {String(previewPhotos.length).padStart(2, "0")}</span></span>
          <button type="button" className={styles.lightboxClose} aria-label="Close photo gallery" onClick={() => lightbox.current?.close()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
        </div>
      </header>
      <div className={styles.lightboxStage}>
        <SpacePhoto image={previewPhotos[activePhoto]} />
        {previewPhotos.length > 1 && <>
          <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxPrevious}`} aria-label="Previous photo" onClick={() => setActivePhoto((current) => (current + previewPhotos.length - 1) % previewPhotos.length)}><ChevronLeft /></button>
          <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxNext}`} aria-label="Next photo" onClick={() => setActivePhoto((current) => (current + 1) % previewPhotos.length)}><ChevronRight /></button>
        </>}
      </div>
      <div className={styles.lightboxFooter}>
        <div className={styles.lightboxCaption}><p>{previewPhotos[activePhoto].alt}</p><span>{project.locationLabel}</span></div>
        <div className={styles.lightboxThumbnails} role="group" aria-label="Choose a property photo">
          {previewPhotos.map((image, index) => <button type="button" key={image.id} aria-label={`View photo ${index + 1}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><SpacePhoto image={image} /></button>)}
        </div>
      </div>
    </dialog>
  </>;
}

function AmenityIcon({ index }: { index: number }) {
  const paths = ["m13 2-8 11h6l-1 9 9-12h-6l1-8Z", "M3 9c5-5 13-5 18 0M6 12c3-3 9-3 12 0M9 15c2-1 4-1 6 0M12 19h.01", "M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3", "m12 3 8 4v6c0 4-5 7-8 9-3-2-8-5-8-9V7l8-4Zm-4 9 3 3 5-6", "M4 21V4h16v17M9 21V7h6v14M12 12h1", "M6 21V3h8a5 5 0 0 1 0 10H6M10 7h4a1 1 0 0 1 0 2h-4", "M4 21v-8h16v8M2 21h20M8 9a4 4 0 1 1 8 0M12 9v4", "M4 3h16v18H4V3Zm4 7 2-3 2 3m0 4 2 3 2-3"];
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[index % paths.length]} /></svg>;
}

function LocationPin() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}
