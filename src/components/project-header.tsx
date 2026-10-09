"use client";

import Link from "next/link";
import { useRef } from "react";
import { AccountCircle, Menu, Search } from "./icons";
import styles from "./project-hero.module.css";

export function ProjectHeader({ onSearch, onContact, activePage }: { onSearch: () => void; onContact: () => void; activePage?: "about" }) {
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
        <button type="button" onClick={() => act(onSearch)}>Program</button>
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
            <button type="button" onClick={() => act(onSearch)}>Find My Space</button>
            <button type="button" onClick={() => act(onContact)}>Contact</button>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
