"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "./icons";
import styles from "./navbar-menu.module.css";

const menuItems = [
  { title: "Home", href: "/" },
  { title: "Spaces", href: "/projects" },
  { title: "About Us", href: "/about" },
  { title: "List Your Space", href: "/list-your-space" },
  { title: "Contact Us", href: "/contact" },
];

export function NavbarMenu({ className = "", spacesHref = "/projects" }: { className?: string; spacesHref?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();

  function closeMenu() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const desktop = window.matchMedia("(min-width: 821px)");
    function handleResize() {
      if (desktop.matches) dialogRef.current?.close();
    }
    desktop.addEventListener("change", handleResize);

    return () => {
      root.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
      desktop.removeEventListener("change", handleResize);
    };
  }, [isOpen]);

  return (
    <div className={`${styles.menuContainer} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.triggerButton}
        onClick={() => {
          dialogRef.current?.showModal();
          setIsOpen(true);
        }}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="dialog"
        aria-label="Open navigation menu"
      >
        <svg className={styles.hamburgerIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        id={menuId}
        className={styles.menuPanel}
        aria-label="Site menu"
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
        }}
      >
        <div className={styles.panelHeader}>
          <Link href="/" className={styles.brand} aria-label="PropMentors home" onClick={closeMenu}>
            <span className={styles.brandMark} aria-hidden="true" />
            <span>PropMentors</span>
          </Link>
          <div className={styles.headerActions}>
            <Link href={spacesHref} className={styles.searchButton} aria-label="Search spaces" onClick={closeMenu}><Search /></Link>
            <button type="button" className={styles.closeButton} aria-label="Close navigation menu" onClick={closeMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </div>

        <nav className={styles.menuNav} aria-label="Main navigation">
          {menuItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href === "/projects" ? spacesHref : item.href} className={styles.menuLink} aria-current={isActive ? "page" : undefined} onClick={closeMenu}>
                <span className={styles.itemTitle}>{item.title}</span>
                <ChevronRight className={styles.itemArrow} />
              </Link>
            );
          })}
        </nav>

        <div className={styles.panelFooter}>
          <Link href="/contact" className={styles.contactButton} onClick={closeMenu}>Schedule a Call <ChevronRight /></Link>
        </div>
      </dialog>
    </div>
  );
}
