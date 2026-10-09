"use client";

import { useState } from "react";
import { ProjectHero, resolveProjectFilters, type ProjectFilters } from "./project-hero";
import { ProjectListings } from "./project-listings";
import { ProjectEnquiries } from "./project-enquiries";
import { RealGuidance } from "./real-guidance";
import { SiteFooter } from "./site-footer";

export function ProjectPage({ initialFilters }: { initialFilters: Partial<ProjectFilters> }) {
  const [search, setSearch] = useState<ProjectFilters | null>(() =>
    Object.values(initialFilters).some(Boolean) ? resolveProjectFilters(initialFilters) : null,
  );

  function findSpaces(filters: ProjectFilters) {
    setSearch(filters);
    requestAnimationFrame(() => document.getElementById("project-listings")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    }));
  }

  return <>
    <main>
      <ProjectHero initialFilters={initialFilters} mapBackground="/project%20/Hero/a.png" onSearch={findSpaces} />
      <ProjectListings key={search ? JSON.stringify(search) : "initial"} search={search} />
      <ProjectEnquiries />
      <RealGuidance />
    </main>
    <SiteFooter homePath="/" />
  </>;
}
