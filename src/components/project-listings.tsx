"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "./icons";
import { PropertyCard } from "./property-card";
import { formatProjectPrice, projects } from "../data/projects";
import { amenityOptions, emptyListingFilters, hasProjectAmenity, heroBudgetRanges, locationNames, matchesListing, projectSpaceType, sortListings, type ListingFilters, type ListingSort } from "../lib/project-listing-filters";
import type { ProjectFilters } from "./project-hero";
import styles from "./project-listings.module.css";

const sortOptions: { value: ListingSort; label: string; description: string }[] = [
  { value: "recommended", label: "Recommended", description: "Our curated selection" },
  { value: "price-low", label: "Price: Low to High", description: "Lower asking prices first" },
  { value: "price-high", label: "Price: High to Low", description: "Higher asking prices first" },
  { value: "name", label: "Name: A to Z", description: "Browse alphabetically" },
];
const pageSize = 6;

function FilterIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 7h6m4 0h6M4 17h10m4 0h2" /><circle cx="12" cy="7" r="2" /><circle cx="16" cy="17" r="2" /></svg>;
}

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>;
}

function initialSelection(search: ProjectFilters | null): ListingFilters {
  if (!search) return emptyListingFilters;
  const spaceTypes: Record<string, string> = { Coworking: "Co-Working", "Managed Offices": "Managed Office", "Conventional Leasing": "Conventional Leasing" };
  const locations: Record<string, string> = { Noida: "noida", Gurgaon: "gurgaon", Delhi: "delhi", Bengaluru: "bengaluru", Mumbai: "mumbai" };
  const range = heroBudgetRanges[search.budget];
  return { ...emptyListingFilters, spaceType: spaceTypes[search.spaceType] ? [spaceTypes[search.spaceType]] : [], location: locations[search.location] ? [locations[search.location]] : [], minPrice: range ? String(range[0]) : "", maxPrice: range && Number.isFinite(range[1]) ? String(range[1]) : "" };
}

export function ProjectListings({ search }: { search: ProjectFilters | null }) {
  const [filters, setFilters] = useState<ListingFilters>(() => initialSelection(search));
  const [sort, setSort] = useState<ListingSort>("recommended");
  const [page, setPage] = useState(1);
  const sortMenu = useRef<HTMLDetailsElement>(null);
  const filterDialog = useRef<HTMLDialogElement>(null);
  const visible = sortListings(projects.filter((project) => matchesListing(project, filters)), sort);
  const pageCount = Math.ceil(visible.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, pageCount));
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeCount = filters.spaceType.length + filters.location.length + filters.amenities.length + Number(Boolean(filters.minPrice || filters.maxPrice)) + Number(filters.hideSoldOut);
  const budgetInvalid = Boolean(filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice));
  const sortLabel = sortOptions.find((option) => option.value === sort)!.label;
  const groups = [
    { key: "spaceType" as const, title: "Space type", options: [...new Set([...projects.map(projectSpaceType), ...filters.spaceType])].map((value) => ({ value, label: value, count: projects.filter((project) => matchesListing(project, { ...filters, spaceType: [value] })).length })) },
    { key: "location" as const, title: "Location", options: [...new Set([...projects.map((project) => project.location), ...filters.location])].map((value) => ({ value, label: locationNames[value] ?? value, count: projects.filter((project) => matchesListing(project, { ...filters, location: [value] })).length })) },
    { key: "amenities" as const, title: "Amenities", options: amenityOptions.filter((value) => projects.some((project) => hasProjectAmenity(project, value)) || filters.amenities.includes(value)).map((value) => ({ value, label: value, count: projects.filter((project) => matchesListing(project, { ...filters, amenities: [...new Set([...filters.amenities, value])] })).length })) },
  ];

  function updateFilters(next: ListingFilters) {
    setFilters(next);
    setPage(1);
  }

  function toggle(group: "spaceType" | "location" | "amenities", value: string) {
    updateFilters({ ...filters, [group]: filters[group].includes(value) ? filters[group].filter((item) => item !== value) : [...filters[group], value] });
  }

  function resetFilters() {
    updateFilters(emptyListingFilters);
    const url = new URL(window.location.href);
    ["spaceType", "location", "budget"].forEach((key) => url.searchParams.delete(key));
    window.history.replaceState(window.history.state, "", url);
  }

  function changePage(next: number) {
    setPage(next);
    document.getElementById("project-listings")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function renderFilters() {
    return <div className={styles.filterFields}>
      {groups.slice(0, 2).map((group) => renderGroup(group))}
      <fieldset className={styles.budget}>
        <legend>Budget</legend><p>Set your price range</p>
        <div className={styles.budgetInputs}>
          <label>Min price<span><span aria-hidden="true">₹</span><input type="number" inputMode="numeric" min="0" step="any" aria-label="Minimum budget" placeholder="Any" value={filters.minPrice} onChange={(event) => updateFilters({ ...filters, minPrice: event.target.value })} /></span></label>
          <label>Max price<span><span aria-hidden="true">₹</span><input type="number" inputMode="numeric" min="0" step="any" aria-label="Maximum budget" placeholder="Any" value={filters.maxPrice} onChange={(event) => updateFilters({ ...filters, maxPrice: event.target.value })} /></span></label>
        </div>
        {budgetInvalid && <p className={styles.budgetError} role="alert">Max price must be at least the min price.</p>}
      </fieldset>
      {groups.slice(2).map((group) => renderGroup(group))}
      <fieldset className={styles.availability}>
        <legend>Availability</legend>
        <label className={styles.option}><input type="checkbox" checked={filters.hideSoldOut} onChange={(event) => updateFilters({ ...filters, hideSoldOut: event.target.checked })} /><span className={styles.check} aria-hidden="true" /><span>Hide sold out</span></label>
      </fieldset>
    </div>;
  }

  function renderGroup(group: (typeof groups)[number]) {
    return <details className={styles.filterGroup} key={group.key} open={group.key !== "amenities"}>
      <summary>{group.title}<ChevronRight /></summary>
      <fieldset className={styles.options}>
        <legend className={styles.srOnly}>{group.title}</legend>
        {group.options.map((option) => <label className={styles.option} key={option.value}>
          <input type="checkbox" checked={filters[group.key].includes(option.value)} onChange={() => toggle(group.key, option.value)} />
          <span className={styles.check} aria-hidden="true" /><span>{option.label}</span><span className={styles.optionCount}>{option.count}</span>
        </label>)}
      </fieldset>
    </details>;
  }

  return <section className={styles.section} id="project-listings" aria-labelledby="project-listings-heading">
    <div className={styles.inner}>
      <div className={styles.heading}><span className={styles.eyebrow}>CURATED SPACES</span><h2 id="project-listings-heading">Find your next space</h2><p>Thoughtfully selected. Ready to explore.</p></div>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filter spaces">
          <div className={styles.filterHeader}><h3><FilterIcon />Filters {activeCount > 0 && <span className={styles.countBadge}>{activeCount}</span>}</h3><button type="button" onClick={resetFilters} disabled={!activeCount}>Clear all</button></div>
          {renderFilters()}
        </aside>
        <div className={styles.results}>
          <div className={styles.toolbar}>
            <p className={styles.resultCount}><strong>{visible.length}</strong> {visible.length === 1 ? "space" : "spaces"} found{activeCount > 0 && <span> · matched to your filters</span>}</p>
            <div className={styles.toolbarActions}>
              <button type="button" className={styles.mobileFilter} onClick={() => filterDialog.current?.showModal()}><FilterIcon />Filters{activeCount > 0 && <span className={styles.countBadge}>{activeCount}</span>}</button>
              <details className={styles.sort} ref={sortMenu} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.removeAttribute("open"); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); sortMenu.current?.removeAttribute("open"); sortMenu.current?.querySelector("summary")?.focus(); } }}>
                <summary><span>Sort by</span><strong>{sortLabel}</strong><ChevronRight /></summary>
                <fieldset className={styles.sortMenu}><legend className={styles.srOnly}>Sort spaces</legend>{sortOptions.map((option) => <label key={option.value} className={styles.sortOption}>
                  <input type="radio" name="listing-sort" value={option.value} checked={sort === option.value} onChange={() => { setSort(option.value); setPage(1); sortMenu.current?.removeAttribute("open"); sortMenu.current?.querySelector("summary")?.focus(); }} />
                  <span><strong>{option.label}</strong><span>{option.description}</span></span><span className={styles.sortCheck} aria-hidden="true">✓</span>
                </label>)}</fieldset>
              </details>
            </div>
          </div>
          {activeCount > 0 && <div className={styles.activeFilters} aria-label="Active filters">
            {groups.flatMap((group) => filters[group.key].map((value) => <button type="button" key={`${group.key}-${value}`} aria-label={`Remove ${group.title}: ${group.key === "location" ? locationNames[value] ?? value : value}`} onClick={() => toggle(group.key, value)}>{group.key === "location" ? locationNames[value] ?? value : value}<CloseIcon /></button>))}
            {(filters.minPrice || filters.maxPrice) && <button type="button" aria-label="Remove budget filter" onClick={() => updateFilters({ ...filters, minPrice: "", maxPrice: "" })}>{filters.minPrice ? formatProjectPrice(Number(filters.minPrice)) : "Any price"} – {filters.maxPrice ? formatProjectPrice(Number(filters.maxPrice)) : "No limit"}<CloseIcon /></button>}
            {filters.hideSoldOut && <button type="button" aria-label="Remove availability filter" onClick={() => updateFilters({ ...filters, hideSoldOut: false })}>Hide sold out<CloseIcon /></button>}
          </div>}
          <div className={styles.cards}>
            {pageItems.map((item) => <PropertyCard key={item.id} property={item} className={styles.card} />)}
            {!visible.length && <div className={styles.empty}><span className={styles.emptyIcon}><Search /></span><h3>A little more room to explore</h3><p>No spaces match this combination. Try a wider budget or remove a filter to see more options.</p><button type="button" onClick={resetFilters}>Clear filters<ChevronRight /></button></div>}
          </div>
          {pageCount > 1 && <nav className={styles.pagination} aria-label="Property pages"><button type="button" aria-label="Previous page" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-label={`Page ${number}`} aria-current={currentPage === number ? "page" : undefined} onClick={() => changePage(number)}>{number}</button>)}<button type="button" aria-label="Next page" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}><ChevronRight /></button></nav>}
          <p className={styles.resultsNote}>{visible.length > 0 ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, visible.length)} of ${visible.length} spaces` : "Your next space could be one filter away."}</p>
        </div>
      </div>
      <p className={styles.srOnly} role="status" aria-live="polite">{visible.length} {visible.length === 1 ? "space matches" : "spaces match"} your filters. Sorted by {sortLabel.toLowerCase()}.</p>
    </div>
    <dialog className={styles.filterDialog} ref={filterDialog} aria-label="Filter spaces" onClick={(event) => { if (event.target === event.currentTarget) filterDialog.current?.close(); }}>
      <div className={styles.mobileHeader}><h3><FilterIcon />Refine your search</h3><button type="button" aria-label="Close filters" onClick={() => filterDialog.current?.close()}><CloseIcon /></button></div>
      <div className={styles.mobileFields}>{renderFilters()}</div>
      <div className={styles.mobileFooter}><button type="button" onClick={resetFilters} disabled={!activeCount}>Clear all</button><button type="button" onClick={() => filterDialog.current?.close()}>Show {visible.length} {visible.length === 1 ? "space" : "spaces"}<ChevronRight /></button></div>
    </dialog>
  </section>;
}
