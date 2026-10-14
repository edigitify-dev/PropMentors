import Form from "next/form";
import { budgets, locations, spaceTypes } from "@/lib/space-search";
import { Search } from "./icons";

export function HeroSearchFilters() {
  return (
    <Form action="/projects#project-listings" className="hero-search-filters" aria-label="Find your space" data-node-id="664:271">
      <label className="hero-search-field">
        <span>Space Type</span>
        <span className="hero-search-select">
          <select name="spaceType" defaultValue={spaceTypes[0]}>
            {spaceTypes.map((type) => <option key={type} value={type}>{type === "Coworking" ? "Co working" : type}</option>)}
          </select>
        </span>
      </label>
      <label className="hero-search-field">
        <span>Location</span>
        <span className="hero-search-select">
          <select name="location" defaultValue={locations[0]}>
            {locations.map((location) => <option key={location}>{location}</option>)}
          </select>
        </span>
      </label>
      <label className="hero-search-field">
        <span>Budget</span>
        <span className="hero-search-select">
          <select name="budget" defaultValue={budgets[0]}>
            {budgets.map((budget) => <option key={budget}>{budget}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="hero-search-submit">Find My Space <Search /></button>
    </Form>
  );
}
