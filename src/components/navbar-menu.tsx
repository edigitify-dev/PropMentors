"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar-menu.module.css";

interface MenuItem {
  title: string;
  subtitle: string;
  href: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

const menuItems: MenuItem[] = [
  {
    title: "Home",
    subtitle: "Overview & key commercial highlights",
    href: "/",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Spaces",
    subtitle: "20+ verified Noida Expressway corporate towers",
    href: "/projects",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    title: "About Us",
    subtitle: "Institutional advisory & track record",
    href: "/about",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "List Your Space",
    subtitle: "Monetize & market your commercial inventory",
    href: "/list-your-space",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Contact Us",
    subtitle: "Direct consultations, inquiries & site visits",
    href: "/contact",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function NavbarMenu({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={`${styles.menuContainer} ${className}`} ref={containerRef}>
      {/* Premium Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.triggerButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle navigation menu"
        data-open={isOpen}
      >
        <span className={styles.hamburgerIcon} aria-hidden="true">
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className={styles.menuBackdrop}
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Luxury Dropdown Menu */}
      {isOpen && (
        <nav
          className={styles.menuDropdown}
          aria-label="Primary site navigation"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownBrand}>
              <span className={styles.brandDot} />
              <span>PropMentors</span>
            </div>
            <span className={styles.quickBadge}>Directory</span>
          </div>

          {/* Links list */}
          <div className={styles.menuNav}>
            {menuItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.menuLink}
                  data-active={isActive}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.itemIcon}>
                    <item.icon />
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemSubtitle}>{item.subtitle}</span>
                  </div>
                  <div className={styles.itemArrow} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className={styles.menuDivider} />

          {/* Quick Action Footer */}
          <div className={styles.dropdownFooter}>
            <a
              href="tel:+918010178010"
              className={styles.hotlineRow}
              onClick={() => setIsOpen(false)}
            >
              <div className={styles.hotlineInfo}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+91 80101 78010</span>
              </div>
              <span className={styles.hotlineAvailability}>Direct Line</span>
            </a>

            <Link
              href="/contact"
              className={styles.scheduleCallBtn}
              onClick={() => setIsOpen(false)}
            >
              Schedule a Consultation
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
