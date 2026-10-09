"use client";

import { useState } from "react";
import { ChevronLeft } from "./icons";
import { PropertyCard } from "./property-card";
import { projects } from "../data/projects";
import type { ProjectFilters } from "./project-hero";
import styles from "./project-listings.module.css";

const groups = [
  { key: "spaceType", title: "Space Type", description: "Select your space type", options: ["Managed Office", "Co-Working", "Conventional", "Other"] },
  { key: "location", title: "Location", description: "Select your work location", options: ["Noida", "Gurugram", "Delhi", "G. Noida"] },
  { key: "amenities", title: "Amenities", description: "Select your amenities", options: ["Parking", "Metro", "Reception", "Meeting Rooms", "Pantry"] },
] as const;

type Selections = Record<(typeof groups)[number]["key"], string[]>;
const listings = projects;
const locationValues: Record<string, string> = { Noida: "noida", Gurugram: "gurgaon", Gurgaon: "gurgaon", Delhi: "delhi", "G. Noida": "greater-noida" };
const heroSpaceTypes: Record<string, string> = { Coworking: "Co-Working", "Managed Offices": "Managed Office", "Conventional Leasing": "Conventional" };
const budgetRanges: Record<string, [number, number]> = { "30k - 80k": [30000, 80000], "80k - 1.5L": [80000, 150000], "1.5L - 3L": [150000, 300000], "3L+": [300000, Infinity] };

function FilterIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" /></svg>;
}

export function ProjectListings({ search }: { search: ProjectFilters | null }) {
  const [selected, setSelected] = useState<Selections>(() => ({
    spaceType: [search ? heroSpaceTypes[search.spaceType] : "Managed Office"],
    location: [search?.location === "Gurgaon" ? "Gurugram" : search?.location ?? "Noida"],
    amenities: search ? [] : ["Parking", "Metro", "Reception"],
  }));
  const [applied, setApplied] = useState(Boolean(search));
  const [sort, setSort] = useState("recommended");
  const range = search ? budgetRanges[search.budget] : undefined;

  const visible = listings.filter((item) => !applied || (
    (!selected.location.length || selected.location.some((location) => locationValues[location] === item.location))
    && (!item.spaceType || !selected.spaceType.length || selected.spaceType.includes(item.spaceType))
    && (!item.amenities || selected.amenities.every((amenity) => item.amenities?.includes(amenity)))
    && (!range || item.price >= range[0] && item.price <= range[1])
  )).toSorted((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : 0);

  function toggle(group: keyof Selections, value: string) {
    setSelected((previous) => ({ ...previous, [group]: previous[group].includes(value) ? previous[group].filter((item) => item !== value) : [...previous[group], value] }));
    setApplied(true);
  }

  function resetFilters() {
    setSelected({ spaceType: [], location: [], amenities: [] });
    setApplied(false);
  }

  return <section className={styles.section} id="project-listings" aria-labelledby="project-listings-heading">
    <div className={styles.inner}>
      <div className={styles.heading}>
        <div>
          <h2 id="project-listings-heading">{applied ? visible.length : 124} Spaces Available</h2>
          <p>Curated spaces matched to your needs.</p>
        </div>
        <label className={styles.sort}>Sort
          <span><select aria-label="Sort spaces" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select><FilterIcon /></span>
        </label>
      </div>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filter spaces">
          {groups.map((group) => <fieldset key={group.key}>
            <legend>{group.title}</legend>
            <p>{group.description}</p>
            <div className={styles.options}>
              {group.options.map((option) => <label className={`${styles.option} ${selected[group.key].includes(option) ? styles.checked : ""}`} key={option}>
                <input type="checkbox" checked={selected[group.key].includes(option)} onChange={() => toggle(group.key, option)} />
                <span className={styles.check} aria-hidden="true" /><span>{option}</span>
              </label>)}
            </div>
          </fieldset>)}
        </aside>
        <div className={styles.results}>
          <div className={styles.cards}>
            {visible.map((item) => <PropertyCard key={item.id} property={item} className={styles.card} />)}
            {!visible.length && <div className={styles.empty} role="status">
              <h3>No spaces match these filters.</h3>
              <p>Try another location or adjust your budget.</p>
              <button type="button" onClick={resetFilters}>Clear filters</button>
            </div>}
          </div>
        </div>
      </div>
      <nav className={styles.pagination} aria-label="Property pages">
        <button type="button" className={styles.arrow} aria-label="Previous page" disabled><ChevronLeft /></button>
        <button type="button" className={styles.current} aria-label="Page 1" aria-current="page">1</button>
        {!applied && <>
          {[2, 3].map((page) => <button type="button" key={page} aria-label={`Page ${page} unavailable`} disabled>{page}</button>)}
          <span aria-hidden="true">…</span>
          <button type="button" aria-label="Page 20 unavailable" disabled>20</button>
        </>}
        <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next page" disabled><ChevronLeft /></button>
      </nav>
      <p className={styles.srOnly} role="status">{applied ? `${visible.length} spaces match your filters.` : "Showing the first six spaces."}</p>
    </div>

  </section>;
}
