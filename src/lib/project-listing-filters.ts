import type { Project } from "../data/projects";

export type ListingFilters = {
  spaceType: string[];
  location: string[];
  amenities: string[];
  minPrice: string;
  maxPrice: string;
  hideSoldOut: boolean;
};

export type ListingSort = "recommended" | "price-low" | "price-high" | "name";

export const emptyListingFilters: ListingFilters = {
  spaceType: [], location: [], amenities: [], minPrice: "", maxPrice: "", hideSoldOut: false,
};

export const locationNames: Record<string, string> = {
  noida: "Noida", gurgaon: "Gurugram", delhi: "Delhi", "greater-noida": "Greater Noida", bengaluru: "Bengaluru", mumbai: "Mumbai",
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
    coworking: "Co-Working", managedoffice: "Managed Office", managedoffices: "Managed Office", conventional: "Conventional Leasing", conventionalleasing: "Conventional Leasing",
  };
  return names[normalise(value)] ?? value;
}

export function hasProjectAmenity(project: Project, amenity: string) {
  const values = (project.amenities ?? project.detail.amenities).map(normalise);
  return (amenityAliases[amenity] ?? [normalise(amenity)]).some((alias) => values.includes(alias));
}

export function matchesListing(project: Project, filters: ListingFilters) {
  return (!filters.spaceType.length || filters.spaceType.includes(projectSpaceType(project)))
    && (!filters.location.length || filters.location.includes(project.location))
    && filters.amenities.every((amenity) => hasProjectAmenity(project, amenity))
    && (!filters.minPrice || project.price >= Number(filters.minPrice))
    && (!filters.maxPrice || project.price <= Number(filters.maxPrice))
    && (!filters.hideSoldOut || normalise(project.badge) !== "soldout");
}

export function sortListings(listings: Project[], sort: ListingSort) {
  return listings.toSorted((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "name") return a.name.localeCompare(b.name, "en-IN");
    return 0;
  });
}
