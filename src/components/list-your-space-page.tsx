"use client";

import Image from "@/components/storage-image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ProjectHeader } from "./project-header";
import { ChevronRight } from "./icons";
import { ProjectEnquiries } from "./project-enquiries";
import { OurApproach } from "./our-approach";
import { SiteFooter } from "./site-footer";
import aboutStyles from "./about-page.module.css";
import styles from "./list-your-space-page.module.css";

const heroImage = "/why/10a08bb92e1114da01c5df205cac22e266a1eea0.jpg";

const approachSteps = [
  {
    id: "understand",
    title: "Understand",
    description: "We start with your business needs, priorities and plans for growth.",
    image: "/images/glance/clients.png",
    width: 586,
    height: 1024,
    alt: "A team discussing their workspace requirements",
  },
  {
    id: "curate",
    title: "Curate",
    description: "We identify spaces aligned with your goals, budget and preferred locations.",
    image: "/images/offers/managed-offices.png",
    width: 736,
    height: 1008,
    alt: "Managed property options being reviewed",
  },
  {
    id: "guide",
    title: "Guide",
    description: "We help you compare, evaluate and move forward with confidence.",
    image: "/images/guidance/experience.png",
    width: 1024,
    height: 683,
    alt: "An adviser reviewing plans and workspace details",
  },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-badge">
      <span className="section-badge-icon" aria-hidden="true">
        <Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized />
      </span>
      <span>{children}</span>
    </div>
  );
}

export function ListYourSpacePage() {
  const router = useRouter();
  const enquiry = useRef<HTMLDialogElement>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [activeApproach, setActiveApproach] = useState(0);

  function openEnquiry() {
    setShareStatus("");
    setDraft("");
    enquiry.current?.showModal();
  }

  async function prepareEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = `List your space enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nSpace details: ${data.get("requirements")}`;
    setDraft(text);
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Your enquiry is copied and ready to share.");
    } catch {
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-listing-enquiry.txt";
      link.click();
      URL.revokeObjectURL(url);
      setShareStatus("Your enquiry is downloaded and ready to share.");
    }
  }

  return (
    <>
      <main className={styles.page}>
        {/* ── Hero ── */}
        <section className={styles.hero} id="list-your-space" aria-labelledby="lys-heading">
          <Image
            className={styles.heroImage}
            src={heroImage}
            width={1440}
            height={920}
            alt="A modern conference room with blue office chairs around a wooden table"
            preload
            unoptimized
          />
          <ProjectHeader activePage={undefined} onContact={openEnquiry} />

          <div className={styles.heroIntro}>
            <Badge>ABOUT PROPMENTORS</Badge>
            <h1 id="lys-heading">Your Space Deserves The Right Tenant</h1>
            <p className={styles.heroSubtitle}>
              List your managed space on PropMentors and connect with businesses<br className={styles.desktopBr} />
              actively looking for their next workspace.
            </p>
            <div className={styles.heroCtas}>
              <button
                type="button"
                id="lys-find-space"
                className={styles.ctaPrimary}
                onClick={() => router.push("/projects")}
              >
                Find My Space <ChevronRight />
              </button>
              <button
                type="button"
                id="lys-view-more"
                className={styles.ctaOutline}
                onClick={openEnquiry}
              >
                View More <ChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* Our Approach */}
        <section className={aboutStyles.decisions} aria-labelledby="decisions-heading">
          <div className={aboutStyles.sectionHeading}>
            <Badge>OUR APPROACH</Badge>
            <div className={aboutStyles.headingRow}>
              <h2 id="decisions-heading">
                Built around<br /> better decisions
              </h2>
              <p>
                We make the process simpler, understanding what you need, curating the right options and helping you make informed choices.
              </p>
            </div>
          </div>
          <div className={`${aboutStyles.decisionGrid} ${styles.desktopDecisions}`}>
            <article className={aboutStyles.decisionColumn}>
              <div className={aboutStyles.decisionText}>
                <h3><span className={styles.decisionNumber}>01</span> - Understand</h3>
                <p>We start with your business needs, priorities and plans for growth.</p>
              </div>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/glance/clients.png" width={586} height={1024} alt="A team discussing their workspace requirements" unoptimized />
              </div>
            </article>
            <article className={`${aboutStyles.decisionColumn} ${aboutStyles.curateColumn}`}>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/offers/managed-offices.png" width={736} height={1008} alt="Managed property options being reviewed" unoptimized />
              </div>
              <div className={aboutStyles.decisionText}>
                <h3><span className={styles.decisionNumber}>02</span> - Curate</h3>
                <p>We identify spaces aligned with your goals, budget and preferred locations.</p>
              </div>
            </article>
            <article className={aboutStyles.decisionColumn}>
              <div className={aboutStyles.decisionText}>
                <h3><span className={styles.decisionNumber}>03</span> - Guide</h3>
                <p>We help you compare, evaluate and move forward with confidence.</p>
              </div>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/guidance/experience.png" width={1024} height={683} alt="An adviser reviewing plans and workspace details" unoptimized />
              </div>
            </article>
          </div>
          <div className={`${styles.mobileDecisions} offers-content`}>
            <div className="offers-cards" aria-label="Our approach options">
              {approachSteps.map((step, index) => {
                const isActive = activeApproach === index;
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`offer-card${isActive ? " is-active" : ""}`}
                    aria-pressed={isActive}
                    aria-controls="lys-approach-preview"
                    aria-labelledby={`lys-approach-${step.id}-title`}
                    aria-describedby={isActive ? `lys-approach-${step.id}-description` : undefined}
                    onPointerEnter={(event) => { if (event.pointerType !== "touch") setActiveApproach(index); }}
                    onFocus={() => setActiveApproach(index)}
                    onClick={() => setActiveApproach(index)}
                  >
                    <span className="offer-card-heading" id={`lys-approach-${step.id}-title`}>
                      <span className={styles.mobileDecisionNumber}>{String(index + 1).padStart(2, "0")}</span>
                      <span>{step.title}</span>
                    </span>
                    <span className="offer-description" id={`lys-approach-${step.id}-description`} aria-hidden={!isActive}>
                      <span>{step.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="offer-preview" id="lys-approach-preview" data-active-approach={approachSteps[activeApproach].id}>
              {approachSteps.map((step, index) => (
                <div key={step.id} className={`offer-image${activeApproach === index ? " is-active" : ""}`} aria-hidden={activeApproach !== index}>
                  <Image src={step.image} alt={step.alt} width={step.width} height={step.height} unoptimized />
                </div>
              ))}
            </div>
          </div>
        </section>

        <OurApproach badge="HOW IT WORKS" />

        {/* ── Find Your Next Space Section (Form) ── */}
        <ProjectEnquiries showOwners={false} />

        <SiteFooter />
      </main>

      {/* ── Enquiry dialog (same pattern as About page) ── */}
      <dialog
        ref={enquiry}
        className={styles.dialog}
        aria-label="Listing enquiry"
        onClick={(e) => { if (e.target === enquiry.current) enquiry.current?.close(); }}
      >
        <form
          className={styles.dialogForm}
          onSubmit={async (e) => {
            e.preventDefault();
            await prepareEnquiry(e.currentTarget);
          }}
        >
          <h2 className={styles.dialogTitle}>List your space</h2>
          <p className={styles.dialogSubtitle}>
            Fill in your details and we&apos;ll be in touch about listing your managed space on PropMentors.
          </p>
          <label className={styles.field}>
            <span>Name</span>
            <input name="name" type="text" placeholder="Your name" required />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" placeholder="your@email.com" required />
          </label>
          <label className={styles.field}>
            <span>Space details</span>
            <textarea name="requirements" placeholder="Location, size, type of space…" rows={4} required />
          </label>
          {shareStatus ? (
            <p className={styles.shareStatus}>{shareStatus}</p>
          ) : null}
          {draft ? (
            <p className={styles.draft}>{draft}</p>
          ) : null}
          <div className={styles.dialogActions}>
            <button type="submit" className={styles.submitBtn}>Send enquiry</button>
            <button type="button" className={styles.cancelBtn} onClick={() => enquiry.current?.close()}>Cancel</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
