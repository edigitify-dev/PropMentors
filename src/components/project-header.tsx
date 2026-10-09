"use client";

import Link from "next/link";
import { useRef } from "react";
import { AccountCircle, Menu, Search } from "./icons";
import styles from "./project-hero.module.css";

export function ProjectHeader({ onSearch, onContact, activePage }: { onSearch: () => void; onContact: () => void; activePage?: "about" | "list-your-space" | "projects" }) {
  const menu = useRef<HTMLDetailsElement>(null);
  function act(callback: () => void) {
    menu.current?.removeAttribute("open");
    callback();
  }
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
        <button type="button" className={styles.iconButton} aria-label="Search spaces" onClick={() => act(onSearch)}><Search /></button>
        <button type="button" className={styles.contactButton} onClick={() => act(onContact)}>Contact</button>
        <button type="button" className={styles.iconButton} aria-label="Prepare your workspace enquiry" aria-haspopup="dialog" onClick={() => act(onContact)}><AccountCircle /></button>
        <details className={styles.menu} ref={menu}>
          <summary aria-label="Navigation menu"><Menu /></summary>
          <nav className={styles.menuPanel} aria-label="More navigation">
            <Link href="/">Home</Link>
            <Link href="/about" aria-current={activePage === "about" ? "page" : undefined}>About Us</Link>
            <Link href="/list-your-space" aria-current={activePage === "list-your-space" ? "page" : undefined}>List Your Space</Link>
            <Link href="/projects" aria-current={activePage === "projects" ? "page" : undefined}>Projects</Link>
            <button type="button" onClick={() => act(onContact)}>Contact</button>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
