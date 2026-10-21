"use client";

import { useRef, useState } from "react";
import { ChevronRight, Search } from "./icons";
import { ProjectHeader } from "./project-header";
import { budgets, locations, resolveProjectFilters, spaceTypes, type ProjectFilters } from "@/lib/space-search";
import styles from "./project-hero.module.css";

export function ProjectHero({
  mapBackground,
  initialFilters = {},
  onSearch,
}: {
  mapBackground?: string;
  initialFilters?: Partial<ProjectFilters>;
  onSearch?: (filters: ProjectFilters) => void;
}) {
  const [filters, setFilters] = useState<ProjectFilters>(() => resolveProjectFilters(initialFilters));
  const [searchSummary, setSearchSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const firstFilter = useRef<HTMLSelectElement>(null);
  const enquiry = useRef<HTMLDialogElement>(null);

  const pills = [
    {
      name: "spaceType" as const,
      label: "Space type",
      values: spaceTypes,
      display: filters.spaceType === "All space types" ? "All types" : filters.spaceType,
    },
    {
      name: "location" as const,
      label: "Preferred location",
      values: locations,
      display: filters.location === "All locations" ? "Location" : filters.location,
    },
    {
      name: "budget" as const,
      label: "Budget",
      values: budgets,
      display: filters.budget === "All budgets" ? "Any budget" : filters.budget,
    },
  ];

  function focusSearch() {
    firstFilter.current?.focus();
  }

  function openEnquiry() {
    setCopied(false);
    enquiry.current?.showModal();
  }

  function applyFilters(overrideFilters?: ProjectFilters) {
    const f = overrideFilters || filters;
    const url = new URL(window.location.href);
    url.searchParams.delete("page");
    if (f.spaceType && f.spaceType !== "All space types") {
      url.searchParams.set("spaceType", f.spaceType);
    } else {
      url.searchParams.delete("spaceType");
    }
    if (f.location && f.location !== "All locations") {
      url.searchParams.set("location", f.location);
    } else {
      url.searchParams.delete("location");
    }
    if (f.budget && f.budget !== "All budgets") {
      url.searchParams.set("budget", f.budget);
    } else {
      url.searchParams.delete("budget");
    }
    if (f.query) {
      url.searchParams.set("query", f.query);
    } else {
      url.searchParams.delete("query");
    }
    window.history.replaceState(null, "", url);
    setSearchSummary(`${f.spaceType} · ${f.location} · ${f.budget}`);
    onSearch?.(f);
    document.getElementById("project-listings")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
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

  return (
    <>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="project-heading">
          {mapBackground && (
            <div
              className={styles.map}
              style={{ backgroundImage: `url("${mapBackground}")` }}
              aria-hidden="true"
            />
          )}

          {/* Header */}
          <ProjectHeader activePage="projects" onSearch={focusSearch} onContact={openEnquiry} />

          {/* Main Copy Area */}
          <div className={styles.intro}>
            <h1 id="project-heading">
              Find the space that fits<br className={styles.desktopBr} /> your business
            </h1>
            <p>Explore curated commercial spaces across locations, formats and budgets — all in one place.</p>
          </div>

          {/* Desktop Filters (Original desktop layout untouched) */}
          <form
            className={styles.filters}
            aria-label="Find commercial spaces"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <label className={styles.field}>
              Space Type
              <span className={styles.selectWrap}>
                <select
                  ref={firstFilter}
                  aria-label="Space Type"
                  name="spaceType"
                  value={filters.spaceType}
                  onChange={(event) => {
                    setFilters({ ...filters, spaceType: event.target.value });
                    setSearchSummary("");
                  }}
                >
                  {spaceTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className={styles.field}>
              Location
              <span className={styles.selectWrap}>
                <select
                  aria-label="Location"
                  name="location"
                  value={filters.location}
                  onChange={(event) => {
                    setFilters({ ...filters, location: event.target.value });
                    setSearchSummary("");
                  }}
                >
                  {locations.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </span>
            </label>
            <label className={styles.field}>
              Budget
              <span className={styles.selectWrap}>
                <select
                  aria-label="Budget"
                  name="budget"
                  value={filters.budget}
                  onChange={(event) => {
                    setFilters({ ...filters, budget: event.target.value });
                    setSearchSummary("");
                  }}
                >
                  {budgets.map((budget) => (
                    <option key={budget}>{budget}</option>
                  ))}
                </select>
              </span>
            </label>
            <button type="submit" className={styles.submit}>
              Find My Space
              <Search />
            </button>
            <p className={styles.status} role="status">
              {searchSummary}
            </p>
          </form>

          {/* Mobile Filters Layout (matches homepage hero mobile layout) */}
          <form
            className={styles.mobileFilters}
            aria-label="Mobile workspace search"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <div className={styles.mobileSearchbar}>
              <Search />
              <input
                type="search"
                name="query"
                aria-label="Search location, building or sector"
                placeholder="Location, building or sector"
                value={filters.query ?? ""}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                enterKeyHint="search"
              />
              <button type="submit" aria-label="Search spaces">
                <ChevronRight />
              </button>
            </div>
            <div className={styles.mobileFilterPills} aria-label="Refine workspace search">
              {pills.map((pill) => (
                <label className={styles.mobileFilterPill} key={pill.name}>
                  <span aria-hidden="true">{pill.display}</span>
                  <ChevronRight />
                  <select
                    name={pill.name}
                    aria-label={pill.label}
                    value={filters[pill.name]}
                    onChange={(event) => {
                      const updated = { ...filters, [pill.name]: event.target.value };
                      setFilters(updated);
                      applyFilters(updated);
                    }}
                  >
                    {pill.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <p className={styles.mobileNote}>
              <a
                href="#project-listings"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("project-listings")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Explore all spaces <ChevronRight />
              </a>
            </p>
          </form>
        </section>
      </div>

      <dialog
        className="hero-dialog"
        ref={enquiry}
        aria-labelledby="project-enquiry-heading"
        onClick={(event) => {
          if (event.target === event.currentTarget) enquiry.current?.close();
        }}
      >
        <div className="dialog-content">
          <button
            type="button"
            className="dialog-close"
            aria-label="Close enquiry"
            onClick={() => enquiry.current?.close()}
          >
            ×
          </button>
          <p className="dialog-eyebrow">PROPMENTORS</p>
          <h2 id="project-enquiry-heading">Let’s find your space</h2>
          <p>
            {filters.spaceType} · {filters.location} · {filters.budget}
          </p>
          <form
            className="enquiry-form"
            onSubmit={(event) => {
              event.preventDefault();
              void copyEnquiry(event.currentTarget);
            }}
          >
            <label>
              Your name
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              What does your team need?
              <textarea name="requirements" rows={3} placeholder="Team size and move-in date" required />
            </label>
            <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p>
            <button className="dialog-primary" type="submit">
              {copied ? "Enquiry copied" : "Copy enquiry"}
            </button>
            <p role="status" className="copy-status">
              {copied ? "Your enquiry is ready to paste and share." : ""}
            </p>
          </form>
        </div>
      </dialog>
    </>
  );
}
