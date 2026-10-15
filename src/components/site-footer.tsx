"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "@/components/icons";

const experts = [
  { id: "one", width: 736, height: 1111 },
  { id: "two", width: 736, height: 1308 },
  { id: "three", width: 736, height: 736 },
  { id: "four", width: 736, height: 1104 },
];

const explore = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "List Your Space", href: "/list-your-space" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

const services = [
  { label: "Commercial Leasing", href: "#workspace-offers" },
  { label: "Tenant Representation", href: "#our-approach" },
  { label: "Landlord Representation", href: "#property-owners" },
  { label: "Advisory", href: "#real-guidance" },
];

const socials = [
  { id: "facebook", label: "Facebook" },
  { id: "google", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter" },
];

export function SiteFooter({ homePath = "", showCta = true, className = "", exploreLinks = explore }: { homePath?: string; showCta?: boolean; className?: string; exploreLinks?: typeof explore }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState("");

  function handleTalkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const spaceType = String(data.get("spaceType") || "").trim();
    const message = String(data.get("message") || "").trim();

    const body = `Name: ${name}\nContact: ${phone}\nEmail: ${email}\nInterested in: ${spaceType}\n\nRequirements:\n${message}`;

    try {
      void navigator.clipboard?.writeText(body);
    } catch {}

    const subject = `Talk to a PropMentor — Enquiry from ${name}`;
    window.location.href = `mailto:hello@propmentors.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus("Your enquiry is ready! We've prepared the email draft and copied a copy to your clipboard.");
  }

  return (
    <div className={`site-footer-wrap ${className}`} data-node-id="363:1256">
      <div className="footer-inner">
        {showCta && <section className="final-cta" id="contact" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Looking for the right space</h2>
          <p>Tell us what you&apos;re looking for. We&apos;ll help you find the space that fits.</p>
          <div className="cta-actions" data-node-id="467:543">
            <div className="cta-experts">
              <span>25+ Experts</span>
              <div className="cta-portraits" aria-hidden="true">
                {experts.map(expert => <div className={`cta-avatar cta-avatar-${expert.id}`} key={expert.id}>
                  <Image src={`/images/footer/expert-${expert.id}.png`} alt="" width={expert.width} height={expert.height} unoptimized />
                </div>)}
              </div>
            </div>
            <div className="cta-divider" aria-hidden="true"><Image src="/images/footer/divider.svg" alt="" width={30} height={.5} loading="eager" unoptimized /></div>
            <button
              type="button"
              className="cta-contact"
              onClick={() => {
                setStatus("");
                dialogRef.current?.showModal();
              }}
              data-node-id="363:1322"
              aria-haspopup="dialog"
            >
              Talk to a PropMentor <span aria-hidden="true"><ArrowUp /></span>
            </button>
          </div>
        </section>}

        <div className="footer-wordmark" aria-hidden="true" data-node-id="364:1365">
          <div className="footer-wordmark-text"><Image src="/images/footer/wordmark.svg" alt="" width={1306} height={206.428} loading="eager" unoptimized /></div>
          <div className="footer-wordmark-crown"><Image src="/images/footer/wordmark-crown.svg" alt="" width={170.921} height={191.705} loading="eager" unoptimized /></div>
        </div>

        <footer className="site-footer">
          <div className="footer-panel" data-node-id="363:1326">
            <div className="footer-brand">
              <div className="footer-brand-header">
                <a className="footer-logo" href={`${homePath}#home`} aria-label="PropMentors home">
                  <Image src="/images/footer/logo.svg" alt="PropMentors" width={34} height={38} loading="eager" unoptimized />
                </a>
                <p className="footer-tagline">Experience real estate excellence.</p>
              </div>
              <div className="footer-socials" aria-label="Social platforms" data-node-id="365:1411">
                {socials.map(social => <span className={`footer-social footer-social-${social.id}`} key={social.id} title={social.label}><Image src={`/images/footer/${social.id}.svg`} alt={social.label} width={31.923} height={31.923} loading="eager" unoptimized /></span>)}
              </div>
            </div>
            <nav className="footer-column" aria-labelledby="footer-explore-heading">
              <h3 id="footer-explore-heading">Explore</h3>
              <ul>{exploreLinks.map(link => <li key={link.label}><a href={link.href.startsWith("/") ? link.href : `${homePath}${link.href}`}>{link.label}</a></li>)}</ul>
            </nav>
            <nav className="footer-column footer-services" aria-labelledby="footer-services-heading">
              <h3 id="footer-services-heading">Services</h3>
              <ul>{services.map(link => <li key={link.label}><a href={`${homePath}${link.href}`}>{link.label}</a></li>)}</ul>
            </nav>
            <div className="footer-column footer-contact">
              <h3>Contact</h3>
              <address><span>Delhi NCR</span><span>+91 XXXXX XXXXX</span><a href="mailto:hello@propmentors.in">hello@propmentors.in</a></address>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Copyright © 2026 PropMentors | All rights reserved</p>
            <p><Link href="/privacy-policy">Privacy Policy</Link> · Terms</p>
          </div>
        </footer>
      </div>

      <dialog
        className="hero-dialog talk-mentor-dialog"
        ref={dialogRef}
        aria-labelledby="talk-mentor-heading"
        onClose={() => setStatus("")}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="dialog-content talk-mentor-content">
          <button
            type="button"
            className="dialog-close"
            aria-label="Close dialog"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
          <p className="dialog-eyebrow">PROPMENTORS</p>
          <h2 id="talk-mentor-heading">Talk to a PropMentor</h2>
          <form className="enquiry-form talk-mentor-form" onSubmit={handleTalkSubmit}>
            <label>
              Your name*
              <input name="name" autoComplete="name" placeholder="Full Name" required maxLength={120} />
            </label>
            <label>
              Contact number*
              <input name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required maxLength={30} />
            </label>
            <label>
              Email address*
              <input name="email" type="email" autoComplete="email" placeholder="name@company.com" required maxLength={254} />
            </label>
            <label>
              Space type / Requirement
              <select name="spaceType" defaultValue="Managed Offices">
                <option value="Managed Offices">Managed Offices</option>
                <option value="Co-Working">Co-Working</option>
                <option value="Conventional Leasing">Conventional Leasing</option>
                <option value="Commercial Advisory">Commercial Advisory</option>
              </select>
            </label>
            <label>
              Tell us what your team needs*
              <textarea
                name="message"
                rows={2}
                placeholder="City, preferred location, team size, move-in timeline and any specific requirements..."
                required
                maxLength={2000}
              />
            </label>
            <p className="form-note">
              Our team of 25+ commercial real estate experts will connect with you to curate the right options.
            </p>
            <button type="submit" className="dialog-primary talk-submit-btn">
              Send Enquiry
            </button>
            {status && (
              <p className="copy-status" role="status" style={{ color: "#2d6a4f", fontWeight: 600 }}>
                {status}
              </p>
            )}
          </form>
        </div>
      </dialog>
    </div>
  );
}
