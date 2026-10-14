"use client";

import Form from "next/form";
import { useState } from "react";
import { budgets, locations, spaceTypes, type ProjectFilters } from "@/lib/space-search";
import { ChevronRight, Search } from "./icons";

export function HeroSearchFilters() {
  const [filters, setFilters] = useState<ProjectFilters>({ spaceType: "All space types", location: locations[0], budget: "All budgets", query: "" });
  const pills = [
    { name: "spaceType" as const, label: "Space type", values: spaceTypes, display: filters.spaceType === "All space types" ? "All types" : filters.spaceType },
    { name: "location" as const, label: "Preferred location", values: locations, display: filters.location === "All locations" ? "Location" : filters.location },
    { name: "budget" as const, label: "Budget", values: budgets, display: filters.budget === "All budgets" ? "Any budget" : filters.budget },
  ];

  function searchFields() {
    return <>
      <label className="hero-search-field hero-search-field-space">
        <span>Space Type</span>
        <span className="hero-search-select">
          <select name="spaceType" value={filters.spaceType} onChange={(event) => setFilters({ ...filters, spaceType: event.target.value })}>
            {spaceTypes.map((type) => <option key={type} value={type}>{type === "Coworking" ? "Co working" : type}</option>)}
          </select>
        </span>
      </label>
      <label className="hero-search-field">
        <span>Location</span>
        <span className="hero-search-select">
          <select name="location" value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })}>
            {locations.map((location) => <option key={location}>{location}</option>)}
          </select>
        </span>
      </label>
      <label className="hero-search-field">
        <span>Budget</span>
        <span className="hero-search-select">
          <select name="budget" value={filters.budget} onChange={(event) => setFilters({ ...filters, budget: event.target.value })}>
            {budgets.map((budget) => <option key={budget}>{budget}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="hero-search-submit">Find My Space <Search /></button>
    </>;
  }

  return <>
    <Form action="/projects#project-listings" className="hero-search-filters" aria-label="Find your space" data-node-id="664:271">
      {searchFields()}
    </Form>
    <Form action="/projects#project-listings" className="hero-mobile-filters" aria-label="Mobile workspace search">
      <div className="hero-mobile-searchbar">
        <Search />
        <input type="search" name="query" aria-label="Search location, building or sector" placeholder="Location, building or sector" value={filters.query ?? ""} onChange={(event) => setFilters({ ...filters, query: event.target.value })} enterKeyHint="search" />
        <button type="submit" aria-label="Search spaces"><ChevronRight /></button>
      </div>
      <div className="hero-filter-pills" aria-label="Refine workspace search">
        {pills.map((pill) => <label className="hero-filter-pill" key={pill.name}>
          <span aria-hidden="true">{pill.display}</span><ChevronRight />
          <select name={pill.name} aria-label={pill.label} value={filters[pill.name]} onChange={(event) => setFilters({ ...filters, [pill.name]: event.target.value })}>
            {pill.values.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>)}
      </div>
    </Form>
  </>;
}
