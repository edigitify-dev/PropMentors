"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, Search } from "./icons";

const properties = [
  { id: "space-01", badge: "DVS signature", width: 1152, height: 2040, cropWidth: 401, cropHeight: 709, cropTop: 314, alt: "Ocean-facing living room with floor-to-ceiling windows" },
  { id: "space-02", badge: "RERA Approved", width: 736, height: 1051, cropWidth: 401, cropHeight: 572, cropTop: 92, alt: "Modern hillside home with an infinity pool and city views" },
  { id: "space-03", badge: "new", width: 1199, height: 1062, cropWidth: 400, cropHeight: 354, cropTop: 38, alt: "Contemporary cream-colored villa with a landscaped entrance" },
  { id: "space-04", badge: "sold out", width: 736, height: 1308, cropWidth: 401, cropHeight: 712, cropTop: 268, alt: "Sunlit living room overlooking a lake and mountains" },
  { id: "space-05", badge: "DVS signature", width: 1080, height: 1920, cropWidth: 400, cropHeight: 712, cropTop: 167, alt: "Modern two-story villa with a garden and swimming pool" },
  { id: "space-06", badge: "DVS signature", width: 736, height: 1104, cropWidth: 400, cropHeight: 600, cropTop: 145, alt: "Poolside home illuminated at sunset" },
].map((property) => ({ ...property, location: "gurgaon", type: "residential", price: 4900000 }));

type Filters = { location: string; propertyType: string; budget: string };
type Property = (typeof properties)[number];
const initialFilters: Filters = { location: "noida", propertyType: "residential", budget: "30k-80k" };
const allFilters: Filters = { location: "all", propertyType: "all", budget: "all" };
const budgets: Record<string, [number, number]> = { "30k-80k": [30000, 80000], "40l-60l": [4000000, 6000000], "60l-plus": [6000000, Infinity] };

function PropertyCard({ property, onSelect }: { property: Property; onSelect?: (property: Property) => void }) {
  return (
    <article className="property-card">
      {onSelect && <button className="property-card-trigger" type="button" aria-label={`View property: ${property.alt}`} aria-haspopup="dialog" onClick={() => onSelect(property)} />}
      <div className="property-photo">
        <div className="property-photo-mask">
          <Image src={`/images/spaces/${property.id}.png`} alt={property.alt} width={property.width} height={property.height} unoptimized
            style={{ top: `${-property.cropTop / 260 * 100}%`, width: `${property.cropWidth / 400 * 100}%`, height: `${property.cropHeight / 260 * 100}%` }} />
        </div>
        <div className="property-badges"><span>Residential</span><span>{property.badge}</span></div>
      </div>
      <div className="property-details">
        <p className="property-price">₹49,00,000</p>
        <h3>Godrej South Estate, DLF Camellias</h3>
        <p className="property-location">Gurgaon (Sector 42)</p>
        <ul className="property-amenities" aria-label="Property features">
          {["1,450 sq ft", "2 Baths", "3 BHK"].map((feature, index) => <li key={feature}>
            {index > 0 && <Image src="/images/spaces/detail-dot.svg" alt="" width={4} height={4} unoptimized />}
            <span>{feature}</span>
          </li>)}
        </ul>
      </div>
    </article>
  );
}

export function ExploreSpaces() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dialogMode, setDialogMode] = useState<"property" | "enquiry">("enquiry");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const visibleProperties = properties.filter((property) => {
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

  function openProperty(property: Property) {
    setSelectedProperty(property);
    setDialogMode("property");
    setCopied(false);
    dialogRef.current?.showModal();
  }

  async function copyEnquiry(form: HTMLFormElement) {
    const data = new FormData(form);
    const propertyDetails = selectedProperty ? `\nProperty: Godrej South Estate, DLF Camellias (${selectedProperty.id})\nLocation: Gurgaon (Sector 42)\nPrice: ₹49,00,000\nStatus: ${selectedProperty.badge}` : "";
    const enquiry = `Property enquiry\nName: ${data.get("name")}\nEmail: ${data.get("email")}${propertyDetails}\nRequirements: ${data.get("requirements")}`;
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
          {visibleProperties.map((property) => <PropertyCard key={property.id} property={property} onSelect={openProperty} />)}
          {!visibleProperties.length && <div className="space-empty-state"><p>Try another location or budget to explore the available spaces.</p><button type="button" className="space-action" onClick={showAllSpaces}>Clear filters</button></div>}
        </div>
        <div className="space-actions">
          <button className="space-action" type="button" onClick={() => { setSelectedProperty(null); setDialogMode("enquiry"); setCopied(false); dialogRef.current?.showModal(); }}>Find My Space <ChevronLeft /></button>
          <button className="space-action space-action-outline" type="button" onClick={() => { showAllSpaces(); gridRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}>View More <ChevronLeft /></button>
        </div>
        {status && <p className="space-results-status" role="status">{status}</p>}
      </div>
      <dialog className="hero-dialog property-dialog" ref={dialogRef} aria-labelledby="property-enquiry-title" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className="dialog-content">
          <button className="dialog-close" aria-label="Close property dialog" onClick={() => dialogRef.current?.close()}>×</button>
          <p className="dialog-eyebrow">PROPMENTORS</p>
          <h2 id="property-enquiry-title">{dialogMode === "property" ? "Property details" : "Let’s find your space"}</h2>
          {dialogMode === "property" && selectedProperty ? <>
            <PropertyCard property={selectedProperty} />
            <button className="dialog-primary" type="button" onClick={() => setDialogMode("enquiry")}>Enquire about this property</button>
          </> : <form className="enquiry-form" onSubmit={(event) => { event.preventDefault(); void copyEnquiry(event.currentTarget); }}>
            <label>Your name<input name="name" autoComplete="name" required /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>What space are you looking for?<textarea name="requirements" key={selectedProperty?.id || "general"} defaultValue={selectedProperty ? "I’m interested in Godrej South Estate, DLF Camellias, Gurgaon (Sector 42)." : ""} placeholder="Preferred location, property type and budget" rows={3} required /></label>
            <p className="form-note">Prepare a copy of your enquiry to share with PropMentors.</p>
            <button className="dialog-primary" type="submit">{copied ? "Enquiry copied" : "Copy enquiry"}</button>
            <p className="copy-status" role="status">{copied ? "Your enquiry is ready to paste and share." : ""}</p>
          </form>}
        </div>
      </dialog>
    </section>
  );
}
