"use client";

import Image from "@/components/storage-image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ProjectHeader } from "./project-header";
import { SiteFooter } from "./site-footer";
import styles from "./contact-page.module.css";
import { useContactDetails } from "./contact-provider";
import { submitEnquiry } from "@/lib/submit-enquiry";

export function ContactPage() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const details = useContactDetails();

  async function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true); setStatus("");
    try {
      await submitEnquiry({ name: String(data.get("name")), email: String(data.get("email")), phone: String(data.get("phone")), subject: String(data.get("subject")), message: String(data.get("message")), website: String(data.get("website") || ""), source: "contact" });
      form.reset();
      setStatus("Thank you. Your enquiry has been received. Our team will be in touch shortly.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Please try again."); }
    finally { setSending(false); }
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero} aria-label="Contact PropMentors">
          <Image className={styles.heroImage} src="/contact/contacthero.png" alt="People meeting in a bright modern office" width={1200} height={1500} preload unoptimized />
          <ProjectHeader activePage="contact" />
        </section>

        <section className={styles.contact} aria-labelledby="contact-heading">
          <div className={styles.contactGrid}>
            <div className={styles.intro}>
              <h1 id="contact-heading" style={{ whiteSpace: "pre-line" }}>{details.heading}</h1>
              <p>{details.introduction}</p>
              <Link href="/projects" className={styles.exploreButton}>Explore Spaces <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg></Link>
            </div>

            <form className={styles.form} id="contact-form" onSubmit={sendEnquiry}>
              <label className={styles.field}><span>Full Name*</span><input name="name" autoComplete="name" placeholder="Your Name" required maxLength={120} /></label>
              <label className={styles.field}><span>Contact Number*</span><input name="phone" type="tel" autoComplete="tel" placeholder="We’ll Reach Out On This Number For Your Onboarding Call." required maxLength={30} /></label>
              <label className={styles.field}><span>Email Address*</span><input name="email" type="email" autoComplete="email" placeholder="For Updates And Official Communication." required maxLength={254} /></label>
              <label className={styles.field}><span>Subject*</span><input name="subject" placeholder="Topic" required maxLength={180} /></label>
              <label className={styles.field}><span>Message*</span><textarea name="message" placeholder="Type Your Message Here" rows={3} required maxLength={5000} /></label>
              <label hidden aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              <button type="submit" className={styles.sendButton} disabled={sending}>{sending ? "Sending…" : "Send Now"}</button>
              {status && <p className={styles.status} role="status">{status}</p>}
            </form>
          </div>

          <address className={styles.details}>
            <div><h2>Phone Number</h2><a href={`tel:${details.phone.replace(/[^+\d]/g, "")}`}>{details.phone}</a></div>
            <div><h2>Email Address</h2><a href={`mailto:${details.email}`}>{details.email}</a></div>
            <div><h2>Location</h2><p style={{ whiteSpace: "pre-line" }}>{details.address}</p></div>
          </address>
        </section>
      </main>
      <SiteFooter homePath="/" />
    </>
  );
}
