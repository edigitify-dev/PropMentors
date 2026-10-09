"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ProjectHeader } from "./project-header";
import { ChevronRight } from "./icons";
import { OurApproach } from "./our-approach";
import { ProjectEnquiries } from "./project-enquiries";
import { SiteFooter } from "./site-footer";
import styles from "./list-your-space-page.module.css";
import aboutStyles from "./about-page.module.css";

const heroImage = "/why/10a08bb92e1114da01c5df205cac22e266a1eea0.jpg";

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
          <ProjectHeader activePage={undefined} onSearch={() => router.push("/projects")} onContact={openEnquiry} />

          <div className={styles.heroIntro}>
            <Badge>ABOUT PROPMENTORS</Badge>
            <h1 id="lys-heading">Your Space Deserves The Right Tenant</h1>
            <p className={styles.heroSubtitle}>
              List your commercial space on PropMentors and connect with businesses<br className={styles.desktopBr} />
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

        {/* ── Our Approach Section from About Us Page ── */}
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
          <div className={aboutStyles.decisionGrid}>
            <article className={aboutStyles.decisionColumn}>
              <div className={aboutStyles.decisionText}>
                <h3>01 - Understand</h3>
                <p>We start with your business needs, priorities and plans for growth.</p>
              </div>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/glance/clients.png" width={586} height={1024} alt="A team discussing their workspace requirements" unoptimized />
              </div>
            </article>
            <article className={`${aboutStyles.decisionColumn} ${aboutStyles.curateColumn}`}>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/offers/managed-offices.png" width={736} height={1008} alt="Commercial property options being reviewed" unoptimized />
              </div>
              <div className={aboutStyles.decisionText}>
                <h3>02 - Curate</h3>
                <p>We identify spaces aligned with your goals, budget and preferred locations.</p>
              </div>
            </article>
            <article className={aboutStyles.decisionColumn}>
              <div className={aboutStyles.decisionText}>
                <h3>03 - Guide</h3>
                <p>We help you compare, evaluate and move forward with confidence.</p>
              </div>
              <div className={aboutStyles.decisionPhoto}>
                <Image src="/images/guidance/experience.png" width={1024} height={683} alt="An adviser reviewing plans and workspace details" unoptimized />
              </div>
            </article>
          </div>
        </section>

        {/* ── Timeline OurApproach component from Homepage ── */}
        <OurApproach />

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
            Fill in your details and we&apos;ll be in touch about listing your commercial space on PropMentors.
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
