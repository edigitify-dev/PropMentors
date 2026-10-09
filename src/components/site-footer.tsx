import Image from "next/image";
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
  { label: "Contact", href: "#contact" },
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

export function SiteFooter({ homePath = "" }: { homePath?: string }) {
  return (
    <div className="site-footer-wrap" data-node-id="363:1256">
      <div className="footer-inner">
        <section className="final-cta" id="contact" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Looking for the right space?</h2>
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
            <a className="cta-contact" href="mailto:hello@propmentors.in" data-node-id="363:1322">Talk to a PropMentor <span aria-hidden="true"><ArrowUp /></span></a>
          </div>
        </section>

        <div className="footer-wordmark" aria-hidden="true" data-node-id="364:1365">
          <div className="footer-wordmark-text"><Image src="/images/footer/wordmark.svg" alt="" width={1306} height={206.428} loading="eager" unoptimized /></div>
          <div className="footer-wordmark-crown"><Image src="/images/footer/wordmark-crown.svg" alt="" width={170.921} height={191.705} loading="eager" unoptimized /></div>
        </div>

        <footer className="site-footer">
          <div className="footer-panel" data-node-id="363:1326">
            <div className="footer-brand">
              <a className="footer-logo" href={`${homePath}#home`} aria-label="PropMentors home"><Image src="/images/footer/logo.svg" alt="PropMentors" width={62} height={69.5466} loading="eager" unoptimized /></a>
              <p>Experience real estate excellence.</p>
              <div className="footer-socials" aria-label="Social platforms" data-node-id="365:1411">
                {socials.map(social => <span className={`footer-social footer-social-${social.id}`} key={social.id} title={social.label}><Image src={`/images/footer/${social.id}.svg`} alt={social.label} width={31.923} height={31.923} loading="eager" unoptimized /></span>)}
              </div>
            </div>
            <nav className="footer-column" aria-labelledby="footer-explore-heading">
              <h3 id="footer-explore-heading">Explore</h3>
              <ul>{explore.map(link => <li key={link.label}><a href={link.href.startsWith("/") ? link.href : `${homePath}${link.href}`}>{link.label}</a></li>)}</ul>
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
            <p>Privacy Policy · Terms</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
