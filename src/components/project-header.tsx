"use client";

import Link from "next/link";
import { NavbarMenu } from "./navbar-menu";
import { NavbarSearch } from "./navbar-search";
import { ScrollHeader } from "./scroll-header";
import styles from "./project-hero.module.css";

export function ProjectHeader({
  activePage,
  revealOnScrollUp = true,
  spacesHref = "/projects",
}: {
  onContact?: () => void;
  activePage?: "about" | "list-your-space" | "projects" | "contact";
  revealOnScrollUp?: boolean;
  spacesHref?: string;
}) {
  const Header = revealOnScrollUp ? ScrollHeader : "header";

  return (
    <Header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="PropMentors home">
        <span aria-hidden="true" />
      </Link>
      <div className={styles.navigation}>
        <nav className={styles.links} aria-label="Main navigation">
          <Link href={spacesHref} aria-current={activePage === "projects" ? "page" : undefined}>
            Spaces
          </Link>
          <Link href="/about" aria-current={activePage === "about" ? "page" : undefined}>
            About Us
          </Link>
          <Link href="/list-your-space" aria-current={activePage === "list-your-space" ? "page" : undefined}>
            List Your Space
          </Link>
          <Link href="/contact" aria-current={activePage === "contact" ? "page" : undefined}>
            Contact Us
          </Link>
        </nav>
        <div className={styles.actions}>
          <NavbarSearch className={styles.iconButton} />
          <Link href="/contact" className={styles.contactButton}>
            Contact
          </Link>
          <NavbarMenu spacesHref={spacesHref} />
        </div>
      </div>
    </Header>
  );
}
