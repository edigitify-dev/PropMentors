"use client";

import { useRef, useState } from "react";
import { Search } from "./icons";
import { ProjectHeader } from "./project-header";
import styles from "./project-hero.module.css";

export type ProjectFilters = { spaceType: string; location: string; budget: string };

const spaceTypes = ["Coworking", "Managed Offices", "Conventional Leasing"];
const locations = ["Noida", "Gurgaon", "Delhi", "Bengaluru", "Mumbai"];
const budgets = ["30k - 80k", "80k - 1.5L", "1.5L - 3L", "3L+"];

export function resolveProjectFilters(initialFilters: Partial<ProjectFilters>): ProjectFilters {
  return {
    spaceType: spaceTypes.includes(initialFilters.spaceType ?? "") ? initialFilters.spaceType! : spaceTypes[0],
    location: locations.includes(initialFilters.location ?? "") ? initialFilters.location! : locations[0],
    budget: budgets.includes(initialFilters.budget ?? "") ? initialFilters.budget! : budgets[0],
  };
}

export function ProjectHero({ mapBackground, initialFilters = {}, onSearch }: {
  mapBackground?: string;
  initialFilters?: Partial<ProjectFilters>;
  onSearch?: (filters: ProjectFilters) => void;
}) {
  const [filters, setFilters] = useState<ProjectFilters>(() => resolveProjectFilters(initialFilters));
  const [searchSummary, setSearchSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const firstFilter = useRef<HTMLSelectElement>(null);
  const enquiry = useRef<HTMLDialogElement>(null);

  function focusSearch() {
    firstFilter.current?.focus();
  }

  function openEnquiry() {
    setCopied(false);
    enquiry.current?.showModal();
  }

  function applyFilters() {
    const url = new URL(window.location.href);
    url.searchParams.set("spaceType", filters.spaceType);
    url.searchParams.set("location", filters.location);
    url.searchParams.set("budget", filters.budget);
    window.history.replaceState(null, "", url);
    setSearchSummary(`${filters.spaceType} · ${filters.location} · ${filters.budget}`);
    onSearch?.(filters);
  }

  async function copyEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const text = `Workspace enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nSpace type: ${filters.spaceType}\nLocation: ${filters.location}\nBudget: ${filters.budget}\nRequirements: ${data.get("requirements")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const download = document.createElement("a");
      download.href = url;
      download.download = "propmentors-workspace-enquiry.txt";
      download.click();
      URL.revokeObjectURL(url);
    }
  }

  return <>
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="project-heading">
        {mapBackground && <div className={styles.map} style={{ backgroundImage: `url("${mapBackground}")` }} aria-hidden="true" />}
        <ProjectHeader onSearch={focusSearch} onContact={openEnquiry} />
        <div className={styles.intro}>
          <h1 id="project-heading">Find the space that fits<br /> your business</h1>
          <p>Explore curated commercial spaces across locations, formats and budgets — all in one place.</p>
        </div>
        <form className={styles.filters} aria-label="Find commercial spaces" onSubmit={(event) => { event.preventDefault(); applyFilters(); }}>
          <label className={styles.field}>Space Type
            <span className={styles.selectWrap}><select ref={firstFilter} aria-label="Space Type" name="spaceType" value={filters.spaceType} onChange={(event) => { setFilters({ ...filters, spaceType: event.target.value }); setSearchSummary(""); }}>{spaceTypes.map((type) => <option key={type}>{type}</option>)}</select></span>
          </label>
          <label className={styles.field}>Location
            <span className={styles.selectWrap}><select aria-label="Location" name="location" value={filters.location} onChange={(event) => { setFilters({ ...filters, location: event.target.value }); setSearchSummary(""); }}>{locations.map((location) => <option key={location}>{location}</option>)}</select></span>
          </label>
          <label className={styles.field}>Budget
            <span className={styles.selectWrap}><select aria-label="Budget" name="budget" value={filters.budget} onChange={(event) => { setFilters({ ...filters, budget: event.target.value }); setSearchSummary(""); }}>{budgets.map((budget) => <option key={budget}>{budget}</option>)}</select></span>
          </label>
          <button type="submit" className={styles.submit}>Find My Space<Search /></button>
          <p className={styles.status} role="status">{searchSummary}</p>
        </form>
      </section>
    </div>
    <dialog className="hero-dialog" ref={enquiry} aria-labelledby="project-enquiry-heading" onClick={(event) => { if (event.target === event.currentTarget) enquiry.current?.close(); }}>
      <div className="dialog-content">
        <button type="button" className="dialog-close" aria-label="Close enquiry" onClick={() => enquiry.current?.close()}>×</button>
        <p className="dialog-eyebrow">PROPMENTORS</p>
        <h2 id="project-enquiry-heading">Let’s find your space</h2>
        <p>{filters.spaceType} · {filters.location} · {filters.budget}</p>
        <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void copyEnquiry(event.currentTarget); }}>
          <label>Your name<input name="name" autoComplete="name" required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>What does your team need?<textarea name="requirements" rows={3} placeholder="Team size and move-in date" required /></label>
          <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p>
          <button className="dialog-primary" type="submit">{copied ? "Enquiry copied" : "Copy enquiry"}</button>
          <p role="status" className="copy-status">{copied ? "Your enquiry is ready to paste and share." : ""}</p>
        </form>
      </div>
    </dialog>
  </>;
}
