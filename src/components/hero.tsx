"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone } from "./icons";
import { NavbarMenu } from "./navbar-menu";
import { HeroSearchFilters } from "./hero-search-filters";
import { useHeroExpansion } from "@/hooks/use-hero-expansion";

const workspaces = [
  "MANAGED OFFICES",
  "CO-WORKING",
  "CONVENTIONAL LEASING",
];

export function Hero() {
  const { trackRef, pinRef, heroRef, photoRef } = useHeroExpansion();

  return <>
    <div className="hero-scroll-track" ref={trackRef} id="home">
    <div className="hero-pin" ref={pinRef}>
    <section className="hero" ref={heroRef} aria-labelledby="hero-heading" data-node-id="631:321">
      <div className="hero-photo" ref={photoRef} aria-hidden="true"><Image src="/images/hero-office-full.png" alt="" width={2948} height={1966} preload unoptimized /></div>
      <div className="hero-top-shade" aria-hidden="true" />
      <header className="hero-header">
        <a className="brand" href="#home" aria-label="PropMentors home"><Image src="/images/propmentors-logo.svg" alt="PropMentors" width={43} height={48.2339} unoptimized /></a>
        <div className="header-links">
          <nav className="primary-nav" aria-label="Main navigation">
            <Link href="/projects">Spaces</Link>
            <Link href="/about">About Us</Link>
            <Link href="/list-your-space">List Your Space</Link>
            <Link href="/contact">Contact Us</Link>
          </nav>
          <div className="header-actions">
            <a href="tel:+918010178010" className="icon-button" aria-label="Call PropMentors"><Phone /></a>
            <Link href="/contact" className="contact-button">Schedule a Call</Link>
            <NavbarMenu className="hero-menu" />
          </div>
        </div>
      </header>
      <div className="workspace-nav">{workspaces.map((space) => <span key={space}>{space}</span>)}</div>
      <h1 className="hero-title" id="hero-heading">The right space</h1>
      <p className="hero-tagline">can change everything</p>
      <HeroSearchFilters />
    </section>
    </div>
    </div>
  </>;
}
