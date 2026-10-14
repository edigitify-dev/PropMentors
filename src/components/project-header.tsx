"use client";

import Link from "next/link";
import { useRef } from "react";
import { AccountCircle, Menu, Search } from "./icons";
import styles from "./project-hero.module.css";

export function ProjectHeader({ activePage }: { onSearch?: () => void; onContact?: () => void; activePage?: "about" | "list-your-space" | "projects" }) {
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  return <header className={styles.header}>
    <Link href="/" className={styles.brand} aria-label="PropMentors home"><span aria-hidden="true" /></Link>
    <div className={styles.navigation}>
      <nav className={styles.links} aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/about" aria-current={activePage === "about" ? "page" : undefined}>About Us</Link>
        <Link href="/list-your-space" aria-current={activePage === "list-your-space" ? "page" : undefined}>List Your Space</Link>
        <Link href="/projects" aria-current={activePage === "projects" ? "page" : undefined}>Projects</Link>
      </nav>
      <div className={styles.actions}>
        <Link href="/projects" className={styles.iconButton} aria-label="Search spaces"><Search /></Link>
        <Link href="/contact" className={styles.contactButton}>Contact</Link>
        <Link href="/projects" className={styles.iconButton} aria-label="Account"><AccountCircle /></Link>
        <details className={styles.menu} ref={mobileMenu} onKeyDown={(event) => {
          if (event.key === "Escape" && mobileMenu.current?.open) {
            mobileMenu.current.open = false;
            mobileMenu.current.querySelector("summary")?.focus();
          }
        }}>
          <summary aria-label="Main navigation"><Menu /></summary>
          <nav className={styles.menuPanel} aria-label="Mobile navigation" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a") && mobileMenu.current) mobileMenu.current.open = false;
          }}>
            <Link href="/">Home</Link>
            <Link href="/about" aria-current={activePage === "about" ? "page" : undefined}>About Us</Link>
            <Link href="/list-your-space" aria-current={activePage === "list-your-space" ? "page" : undefined}>List Your Space</Link>
            <Link href="/projects" aria-current={activePage === "projects" ? "page" : undefined}>Projects</Link>
            <Link href="/contact">Contact Us</Link>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
