"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ProjectHeader } from "./project-header";
import { SiteFooter } from "./site-footer";
import styles from "./contact-page.module.css";

export function ContactPage() {
  const [status, setStatus] = useState("");

  function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Name: ${data.get("name")}\nContact number: ${data.get("phone")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
    window.location.href = `mailto:hello@propmentors.com?subject=${encodeURIComponent(String(data.get("subject")))}&body=${encodeURIComponent(body)}`;
    setStatus("Your enquiry is ready in your email app. Send the draft to get in touch.");
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero} aria-label="Contact PropMentors">
          <Image className={styles.heroImage} src="/contact/contacthero.png" alt="People meeting in a bright modern office" width={1200} height={1500} preload unoptimized />
          <ProjectHeader />
        </section>

        <section className={styles.contact} aria-labelledby="contact-heading">
          <div className={styles.contactGrid}>
            <div className={styles.intro}>
              <h1 id="contact-heading">Ready?<br />Let’s Talk</h1>
              <p>From first conversations to final decisions - we’re here to make every step clearer, simpler, and more thoughtful.</p>
              <Link href="/projects" className={styles.exploreButton}>Explore Spaces <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg></Link>
            </div>

            <form className={styles.form} id="contact-form" onSubmit={sendEnquiry}>
              <label className={styles.field}><span>Full Name*</span><input name="name" autoComplete="name" placeholder="Your Name" required maxLength={120} /></label>
              <label className={styles.field}><span>Contact Number*</span><input name="phone" type="tel" autoComplete="tel" placeholder="We’ll Reach Out On This Number For Your Onboarding Call." required maxLength={30} /></label>
              <label className={styles.field}><span>Email Address*</span><input name="email" type="email" autoComplete="email" placeholder="For Updates And Official Communication." required maxLength={254} /></label>
              <label className={styles.field}><span>Subject*</span><input name="subject" placeholder="Topic" required maxLength={180} /></label>
              <label className={styles.field}><span>Message*</span><textarea name="message" placeholder="Type Your Message Here" rows={3} required maxLength={5000} /></label>
              <button type="submit" className={styles.sendButton}>Send Now</button>
              {status && <p className={styles.status} role="status">{status}</p>}
            </form>
          </div>

          <address className={styles.details}>
            <div><h2>Phone Number</h2><a href="tel:+918010178010">+91 8010178010</a></div>
            <div><h2>Email Address</h2><a href="mailto:hello@propmentors.com">hello@propmentors.com</a></div>
            <div><h2>Location</h2><p>G.F.C Business Centre, H Block ,<br />Connaught Place, Delhi - 110001</p></div>
          </address>
        </section>
      </main>
      <SiteFooter homePath="/" />
    </>
  );
}
