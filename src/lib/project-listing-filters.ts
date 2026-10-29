import { imageUrl } from "./image-storage";
import type { FinishedType, Project } from "@/lib/project-types";

export type ListingFilters = {
  query: string;
  spaceType: string[];
  finishedType: string[];
  location: string[];
  amenities: string[];
  minPrice: string;
  maxPrice: string;
  hideSoldOut: boolean;
};

export type ListingSort = "recommended" | "price-low" | "price-high" | "name";

export const emptyListingFilters: ListingFilters = {
  query: "", spaceType: [], finishedType: [], location: [], amenities: [], minPrice: "", maxPrice: "", hideSoldOut: false,
};

export const finishedTypeOptions: FinishedType[] = ["Bare shell", "Semi-Furnished", "Ready-to-move"];

export const locationNames: Record<string, string> = {
  noida: "Noida",
  "greater-noida": "GNoida",
  gnoida: "GNoida",
  delhi: "Delhi",
};

export const heroBudgetRanges: Record<string, [number, number]> = {
  "30k - 80k": [30000, 80000], "80k - 1.5L": [80000, 150000], "1.5L - 3L": [150000, 300000], "3L+": [300000, Infinity],
};

const amenityAliases: Record<string, string[]> = {
  Parking: ["parking", "visitorparking"],
  "Wi-Fi": ["wifi", "highspeedwifi"],
  "Power Backup": ["powerbackup", "247powerbackup"],
  "Meeting Rooms": ["meetingrooms"],
  Reception: ["reception"],
  Security: ["security", "247security"],
  "Lift Access": ["lift", "liftaccessibility"],
  Pantry: ["pantry"],
};

export const amenityOptions = Object.keys(amenityAliases);

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function projectSpaceType(project: Project) {
  const value = project.spaceType ?? project.category;
  const names: Record<string, string> = {
    coworking: "Co-Working",
    managedoffice: "Managed",
    managedoffices: "Managed",
    conventional: "Conventional Leasing",
    conventionalleasing: "Conventional Leasing",
    manage: "Managed",
    managed: "Managed",
    commercial: "Managed",
  };
  return names[normalise(value)] ?? value;
}

export function hasProjectAmenity(project: Project, amenity: string) {
  const values = (project.amenities ?? project.detail.amenities).map(normalise);
  return (amenityAliases[amenity] ?? [normalise(amenity)]).some((alias) => values.includes(alias));
}

export function matchesListing(project: Project, filters: ListingFilters) {
  const searchText = normalise([project.name, ...(project.aliases ?? []), project.locationLabel, project.detail.location.address].join(" "));
  const matchesQuery = filters.query.trim().split(/\s+/).every((term) => searchText.includes(normalise(term)));
  return matchesQuery
    && (!filters.spaceType.length || filters.spaceType.includes(projectSpaceType(project)))
    && (!filters.finishedType.length || (project.finishedTypes ?? []).some((value) => filters.finishedType.includes(value)))
    && (!filters.location.length || filters.location.includes(project.location))
    && filters.amenities.every((amenity) => hasProjectAmenity(project, amenity))
    && (!filters.minPrice || project.price !== null && project.price >= Number(filters.minPrice))
    && (!filters.maxPrice || project.price !== null && project.price <= Number(filters.maxPrice))
    && (!filters.hideSoldOut || normalise(project.badge) !== "soldout");
}

export function hasHostedPhotos(project: Project) {
  const images = [
    project.cover,
    ...(project.detail?.gallery ?? []),
    project.detail?.views?.exterior,
    project.detail?.views?.interior,
  ].filter(Boolean);
  return images.some((image) => typeof image?.src === "string" && imageUrl(image.src) !== imageUrl("/images/spaces/property-placeholder.svg") && /^https:\/\//i.test(imageUrl(image.src)));
}

export function sortListings(listings: Project[], sort: ListingSort) {
  return listings.toSorted((a, b) => {
    if (sort === "price-low" || sort === "price-high") {
      if (a.price === null) return b.price === null ? 0 : 1;
      if (b.price === null) return -1;
      return sort === "price-low" ? a.price - b.price : b.price - a.price;
    }
    if (sort === "name") return a.name.localeCompare(b.name, "en-IN");
    return Number(hasHostedPhotos(b)) - Number(hasHostedPhotos(a));
  });
}
