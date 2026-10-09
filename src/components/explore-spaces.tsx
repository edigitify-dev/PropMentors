"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, Search } from "./icons";
import { PropertyCard } from "./property-card";
import { projects } from "../data/projects";

type Filters = { location: string; propertyType: string; budget: string };
const initialFilters: Filters = { location: "noida", propertyType: "residential", budget: "30k-80k" };
const allFilters: Filters = { location: "all", propertyType: "all", budget: "all" };
const budgets: Record<string, [number, number]> = { "30k-80k": [30000, 80000], "40l-60l": [4000000, 6000000], "60l-plus": [6000000, Infinity] };

export function ExploreSpaces() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const visibleProperties = projects.filter((property) => {
    if (!appliedFilters) return true;
    const budget = budgets[appliedFilters.budget];
    return (appliedFilters.location === "all" || property.location === appliedFilters.location)
      && (appliedFilters.propertyType === "all" || property.type === appliedFilters.propertyType)
      && (!budget || property.price >= budget[0] && property.price <= budget[1]);
  });

  function showAllSpaces() {
    setFilters(allFilters);
    setAppliedFilters(null);
    setStatus("Showing all six spaces.");
  }

  async function copyEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const enquiry = `Property enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nRequirements: ${data.get("requirements")}`;
    try { await navigator.clipboard.writeText(enquiry); setCopied(true); }
    catch {
      const url = URL.createObjectURL(new Blob([enquiry], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "propmentors-property-enquiry.txt";
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <section className="explore-spaces" id="explore-spaces" aria-labelledby="explore-heading" data-node-id="346:2059">
      <div className="explore-inner">
        <div className="section-badge">
          <span className="section-badge-icon" aria-hidden="true"><Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized /></span>
          <span>EXPLORE OUR SPACES</span>
        </div>
        <div className="explore-heading-row">
          <h2 id="explore-heading">Spaces that fit the way you work</h2>
          <p>Explore a curated selection of commercial spaces across locations, formats and budgets.</p>
        </div>
        <form className="space-filters" onSubmit={(event) => { event.preventDefault(); setAppliedFilters({ ...filters }); setStatus(""); }} aria-label="Filter properties">
          <div className="space-filter-fields">
            <div className="space-filter"><label htmlFor="space-location">Location</label>
              <span className="space-select">
                <select id="space-location" name="location" value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })}>
                  <option value="noida">Noida</option><option value="gurgaon">Gurgaon</option><option value="all">All locations</option>
                </select><ChevronLeft />
              </span>
            </div>
            <div className="space-filter"><label htmlFor="space-property-type">Property Type</label>
              <span className="space-select">
                <select id="space-property-type" name="property-type" value={filters.propertyType} onChange={(event) => setFilters({ ...filters, propertyType: event.target.value })}>
                  <option value="residential">Residential</option><option value="commercial">Commercial</option><option value="all">All property types</option>
                </select><ChevronLeft />
              </span>
            </div>
            <div className="space-filter"><label htmlFor="space-budget">Budget</label>
              <span className="space-select">
                <select id="space-budget" name="budget" value={filters.budget} onChange={(event) => setFilters({ ...filters, budget: event.target.value })}>
                  <option value="30k-80k">30k - 80k</option><option value="40l-60l">₹40L - ₹60L</option><option value="60l-plus">₹60L and above</option><option value="all">All budgets</option>
                </select><ChevronLeft />
              </span>
            </div>
          </div>
          <button type="submit" className="space-search-button">Search <Search /></button>
        </form>
        {appliedFilters && <p className="space-results-status" role="status">{visibleProperties.length ? `${visibleProperties.length} spaces match your search.` : "No spaces match these filters."}</p>}
        <div className="property-grid" ref={gridRef} id="property-results">
          {visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
          {!visibleProperties.length && <div className="space-empty-state"><p>Try another location or budget to explore the available spaces.</p><button type="button" className="space-action" onClick={showAllSpaces}>Clear filters</button></div>}
        </div>
        <div className="space-actions">
          <button className="space-action" type="button" onClick={() => { setCopied(false); dialogRef.current?.showModal(); }}>Find My Space <ChevronLeft /></button>
          <button className="space-action space-action-outline" type="button" onClick={() => { showAllSpaces(); gridRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}>View More <ChevronLeft /></button>
        </div>
        {status && <p className="space-results-status" role="status">{status}</p>}
      </div>
      <dialog className="hero-dialog property-dialog" ref={dialogRef} aria-labelledby="property-enquiry-title" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className="dialog-content">
          <button className="dialog-close" aria-label="Close property dialog" onClick={() => dialogRef.current?.close()}>×</button>
          <p className="dialog-eyebrow">PROPMENTORS</p>
          <h2 id="property-enquiry-title">Let’s find your space</h2>
          <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void copyEnquiry(event.currentTarget); }}>
            <label>Your name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>What space are you looking for?<textarea name="requirements" placeholder="Preferred location, property type and budget" rows={3} required /></label>
            <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p>
            <button className="dialog-primary" type="submit">{copied ? "Enquiry copied" : "Copy enquiry"}</button>
            <p className="copy-status" role="status">{copied ? "Your enquiry is ready to paste and share." : ""}</p>
          </form>
        </div>
      </dialog>
    </section>
  );
}
