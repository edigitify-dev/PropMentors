"use client";

import Link from "next/link";
import { AccountCircle, Search } from "./icons";
import styles from "./project-hero.module.css";

export function ProjectHeader({ activePage }: { onSearch?: () => void; onContact?: () => void; activePage?: "about" | "list-your-space" | "projects" }) {
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
        <Link href="/projects" className={styles.contactButton}>Contact</Link>
        <Link href="/projects" className={styles.iconButton} aria-label="Account"><AccountCircle /></Link>
      </div>
    </div>
  </header>;
}
