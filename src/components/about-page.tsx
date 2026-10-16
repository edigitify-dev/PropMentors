"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AtAGlance } from "./at-a-glance";
import { WorkspaceOffers } from "./workspace-offers";
import { ProjectHeader } from "./project-header";
import { PropertyCard } from "./property-card";
import { DestinationMap } from "./destination-map";
import { SiteFooter } from "./site-footer";
import { ChevronLeft, PlayCircle } from "./icons";
import { projects } from "../data/projects";
import { businessDestinations as cities } from "../data/business-destinations";
import styles from "./about-page.module.css";

const aboutImages = {
  hero: "/about/f017dfaa52a8616b05e1acbe08abab354496a17e.jpg",
  city: "/about/a32ed8b05c100a50648b2b62f02ea4c4c1100934.png",
  adviser: "/about/3267b2cbd3766e5bbd74e357ac0a3a48573eda5a.jpg",
};

function Badge({ children }: { children: React.ReactNode }) {
  return <div className="section-badge"><span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span><span>{children}</span></div>;
}

function SectionHeading({ badge, id, title, children }: { badge: string; id: string; title: React.ReactNode; children: React.ReactNode }) {
  return <div className={styles.sectionHeading}><Badge>{badge}</Badge><div className={styles.headingRow}><h2 id={id}>{title}</h2><p>{children}</p></div></div>;
}

export function AboutPage() {
  const router = useRouter();
  const enquiry = useRef<HTMLDialogElement>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [draft, setDraft] = useState("");

  function openEnquiry() {
    setShareStatus("");
    setDraft("");
    enquiry.current?.showModal();
  }

  async function prepareEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = `Workspace enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nRequirements: ${data.get("requirements")}`;
    setDraft(text);
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Your enquiry is copied and ready to share.");
    } catch {
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-workspace-enquiry.txt";
      link.click();
      URL.revokeObjectURL(url);
      setShareStatus("Your enquiry is downloaded and ready to share.");
    }
  }

  return <>
    <main className={styles.page}>
      <section className={styles.hero} id="about" aria-labelledby="about-heading">
        <Image className={styles.heroImage} src={aboutImages.hero} width={1440} height={920} alt="A team discussing commercial real estate around a meeting table" preload unoptimized />
        <ProjectHeader activePage="about" onSearch={() => router.push("/projects")} onContact={openEnquiry} />
        <div className={styles.heroIntro}><Badge>ABOUT PROPMENTORS</Badge><h1 id="about-heading">Space Is The Product</h1><p>Guidance is the difference.</p></div>
        {/* <p className={styles.heroDescription}>PropMentors helps businesses find, evaluate and secure commercial spaces — from managed offices and co-working spaces to conventional leasing.</p> */}
      </section>
      <section className={styles.belief} aria-label="Our approach to commercial real estate">
        <Image className={styles.beliefImage} src={aboutImages.city} width={1569} height={1003} alt="A city of modern commercial buildings" unoptimized />
        <div className={styles.beliefCopy}>
          <div><h2>We make commercial real<br /> estate easier to navigate.</h2><p>Finding the right commercial space is about more than a location. It is about understanding your business, comparing your options and making the right move.</p></div>
          <div><h2>From requirement to<br /> right-fit space.</h2><p>We bring together relevant spaces, market understanding and practical guidance to help businesses move forward with confidence.</p></div>
        </div>
      </section>
      <section className={styles.decisions} aria-labelledby="decisions-heading">
        <SectionHeading badge="OUR APPROACH" id="decisions-heading" title={<>Built around<br /> better decisions</>}>We make the process simpler, understanding what you need, curating the right options and helping you make informed choices.</SectionHeading>
        <div className={styles.decisionGrid}>
          <article className={styles.decisionColumn}><div className={styles.decisionText}><h3>01 - Understand</h3><p>We start with your business needs, priorities and plans for growth.</p></div><div className={styles.decisionPhoto}><Image src="/images/glance/clients.png" width={586} height={1024} alt="A team discussing their workspace requirements" unoptimized /></div></article>
          <article className={`${styles.decisionColumn} ${styles.curateColumn}`}><div className={styles.decisionPhoto}><Image src="/images/offers/managed-offices.png" width={736} height={1008} alt="Commercial property options being reviewed" unoptimized /></div><div className={styles.decisionText}><h3>02 - Curate</h3><p>We identify spaces aligned with your goals, budget and preferred locations.</p></div></article>
          <article className={styles.decisionColumn}><div className={styles.decisionText}><h3>03 - Guide</h3><p>We help you compare, evaluate and move forward with confidence.</p></div><div className={styles.decisionPhoto}><Image src="/images/guidance/experience.png" width={1024} height={683} alt="An adviser reviewing plans and workspace details" unoptimized /></div></article>
        </div>
      </section>
      <WorkspaceOffers />
      <AtAGlance />
      <AboutMarkets />
      <AboutTeam />
    </main>
    <SiteFooter homePath="/" />
    <dialog className="hero-dialog" ref={enquiry} aria-labelledby="about-enquiry-heading" onClick={(event) => { if (event.target === event.currentTarget) enquiry.current?.close(); }}>
      <div className="dialog-content"><button type="button" className="dialog-close" aria-label="Close workspace enquiry" onClick={() => enquiry.current?.close()}>×</button><p className="dialog-eyebrow">PROPMENTORS</p><h2 id="about-enquiry-heading">Let’s find your space</h2>
        <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void prepareEnquiry(event.currentTarget); }}>
          <label>Your name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>What does your team need?<textarea name="requirements" rows={3} placeholder="Preferred city, team size and move-in date" required /></label>
          <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p><button type="submit" className="dialog-primary">Copy enquiry</button>{draft && <a className={styles.email} href={`mailto:hello@propmentors.in?subject=${encodeURIComponent("Workspace enquiry")}&body=${encodeURIComponent(draft)}`}>Share by email</a>}<p className="copy-status" role="status">{shareStatus}</p>
        </form>
      </div>
    </dialog>
  </>;
}

function AboutMarkets() {
  const [active, setActive] = useState<number | null>(null);
  const city = active === null ? null : cities[active];
  return <section className={styles.markets} aria-labelledby="markets-heading">
    <SectionHeading badge="IN KEY LOCATIONS" id="markets-heading" title={<>Where business<br /> happens, we’re there</>}>PropMentors operates across key commercial destinations, helping businesses discover the spaces and opportunities that matter to them.</SectionHeading>
    <div className={styles.cityTabs} role="group" aria-label="Explore business destinations">{cities.map((item, index) => <button type="button" key={item.name} aria-pressed={active === index} onClick={() => setActive(index)}>{item.name}</button>)}</div>
    <div className={styles.marketMap}>
      <DestinationMap active={active} onSelect={setActive}>
        {city && <div className={styles.mapPreview}><PropertyCard property={projects[city.projectIndex]} className={styles.mapCard} /><Link className={styles.mapCta} href="/projects">View Our Spaces <ChevronLeft /></Link></div>}
      </DestinationMap>
    </div>
    <p className={styles.srOnly} role="status">{city ? `Selected destination: ${city.name}` : "Select a city marker to explore spaces."}</p>
  </section>;
}

const advisers = [
  { image: aboutImages.adviser, width: 1440, height: 920, role: "Commercial Leasing", alt: "Commercial property adviser standing outside an office", position: "center" },
  { image: "/images/footer/expert-one.png", width: 736, height: 1111, role: "Workspace Advisory", alt: "Workspace adviser portrait", position: "center 25%" },
  { image: "/images/footer/expert-two.png", width: 736, height: 1308, role: "Tenant Representation", alt: "Tenant representation adviser portrait", position: "center 25%" },
  { image: "/images/footer/expert-three.png", width: 736, height: 736, role: "Property Advisory", alt: "Property adviser portrait", position: "center 25%" },
  { image: "/images/footer/expert-four.png", width: 736, height: 1104, role: "Business Spaces", alt: "Business workspace adviser portrait", position: "center 25%" },
];

function AboutTeam() {
  const [active, setActive] = useState(0);
  const thumbnails = useRef<HTMLDivElement>(null);

  function select(index: number) {
    setActive(index);
    const button = thumbnails.current?.children[index] as HTMLButtonElement | undefined;
    const rail = thumbnails.current;
    if (button && rail) rail.scrollTo({ left: Math.max(0, button.offsetLeft - rail.offsetLeft - 8), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <section className={styles.team} aria-labelledby="team-heading" aria-roledescription="carousel" aria-label="Meet the PropMentors" onKeyDown={(event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select((active + (event.key === "ArrowLeft" ? -1 : 1) + advisers.length) % advisers.length);
  }}>
    <div className={styles.teamPortrait} id="about-team-portrait">{advisers.map((adviser, index) => <Image key={adviser.image} data-active={active === index} src={adviser.image} width={adviser.width} height={adviser.height} alt={adviser.alt} aria-hidden={active !== index} style={{ objectPosition: adviser.position }} unoptimized />)}</div>
    <SectionHeading badge="MEET PROPMENTORS" id="team-heading" title={<>Experience you<br /> can talk to</>}>Real estate is ultimately about people. Our team brings commercial understanding, practical advice and the capability to turn requirements into the right spaces.</SectionHeading>
    <div className={styles.teamBottom}>
      <div className={styles.teamControls}><button type="button" aria-label="Previous PropMentor" onClick={() => select((active + advisers.length - 1) % advisers.length)}><ChevronLeft /></button><button type="button" aria-label="Next PropMentor" onClick={() => select((active + 1) % advisers.length)}><ChevronLeft /></button></div>
      <div className={styles.teamThumbnails} ref={thumbnails}>{advisers.map((adviser, index) => <button type="button" className={styles.teamThumbnail} key={adviser.image} aria-label={`Show ${adviser.role} adviser`} aria-pressed={active === index} aria-controls="about-team-portrait" onClick={() => select(index)}><Image src={adviser.image} width={adviser.width} height={adviser.height} alt="" style={{ objectPosition: adviser.position }} unoptimized /><span className={styles.thumbnailPlay} aria-hidden="true"><PlayCircle /></span><span className={styles.adviserCaption}>PropMentors<br /><strong>{adviser.role}</strong></span></button>)}</div>
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">PropMentor {active + 1} of {advisers.length}: {advisers[active].role}</p>
  </section>;
}
