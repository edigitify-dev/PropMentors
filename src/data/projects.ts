import { buildingResearch, type BuildingRecord } from "./building-research";
import { getProjectMedia } from "./project-images-data";

import type { Project, ProjectImage, ProjectFact, FinishedType } from "../lib/project-types";
export type { Project, ProjectImage, ProjectFact, FinishedType, WorkspaceOption } from "../lib/project-types";
export { projectHref, formatProjectPrice } from "../lib/project-types";

const propertyPlaceholder: ProjectImage = {
  id: "property-placeholder", src: "/images/spaces/property-placeholder.svg",
  alt: "Property photographs available on request", width: 1200, height: 780,
  cropWidth: 400, cropHeight: 260, cropTop: 0,
};

// Keep established links for buildings retained in the spreadsheet. Buildings
// omitted from the sheet are no longer appended as sample inventory.
const legacyAliases: Record<string, string[]> = {
  "max-towers": ["noida-exp-01", "space-01", "godrej-south-estate-dlf-camellias", "kr-signature-sector-135"],
  "max-square": ["noida-exp-02", "space-02", "skyline-residences"],
  "advant-navis-business-park": ["noida-exp-03", "space-03", "garden-court-villas"],
  "express-trade-tower": ["express-trade-tower-i", "noida-exp-05", "space-05", "parkside-villas"],
  "candor-techspace-sector-135": ["candor-techspace-n1", "candor-techspace-n2", "noida-exp-11", "noida-exp-12"],
  "embassy-oxygen-business-park": ["noida-exp-13"],
  "dlf-tech-park": ["dlf-techpark", "noida-exp-14"],
  "aykon-tower": ["noida-exp-17"],
  "assotech-business-cresterra": ["noida-exp-18"],
  "tech-boulevard": ["boulevard"],
  "jask-tower-sector-127": ["jask"],
};

function locationLabel(building: BuildingRecord) {
  return building.sector === "Film City" ? "Film City, Noida" : `Noida (Sector ${building.sector})`;
}

function formatArea(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function areaRange(building: BuildingRecord) {
  if (building.minArea && building.maxArea) {
    return building.minArea === building.maxArea
      ? `${formatArea(building.minArea)} sq.ft.`
      : `${formatArea(building.minArea)}–${formatArea(building.maxArea)} sq.ft.`;
  }
  if (building.minArea || building.maxArea) return `${formatArea((building.minArea ?? building.maxArea)!)} sq.ft.`;
  return null;
}

function describeBuilding(building: BuildingRecord) {
  const location = building.sector === "Film City" ? "Film City, Noida" : `Sector ${building.sector}, Noida`;
  if (building.source.status !== "matched") {
    return `${building.name} is listed in ${location}. Contact PropMentors for building specifications, office configurations and current leasing availability.`;
  }
  const description = [`${building.name} offers commercial office space in ${location}.`];
  const area = areaRange(building);
  if (area) description.push(`Published office sizes: ${area}` + ".");
  const configuration = building.specifications.find(([label]) => label === "Configuration")?.[1];
  if (configuration) description.push(`Building configuration: ${configuration}.`);
  if (building.amenities.length) description.push(`Facilities include ${building.amenities.slice(0, 4).map((item) => item.toLowerCase()).join(", ")}.`);
  if (building.nearestMetro) description.push(`The listed nearest metro station is ${building.nearestMetro}.`);
  return description.join(" ");
}

function buildingPhotos(building: BuildingRecord): ProjectImage[] {
  return building.photos.map((photo, index) => ({
    id: `${building.slug}-photo-${index + 1}`,
    src: photo.src,
    alt: `${building.name}, ${locationLabel(building)} — photograph ${index + 1}`,
    width: photo.width,
    height: photo.height,
    cropWidth: 400,
    cropHeight: 260,
    cropTop: 0,
  }));
}

export const projects: Project[] = buildingResearch.map((building) => {
  const location = locationLabel(building);
  const photographs = buildingPhotos(building);
  const suppliedMedia = getProjectMedia(building.slug, building.name);
  const gallery = suppliedMedia?.gallery ?? (photographs.length ? photographs : [{ ...propertyPlaceholder, id: `${building.slug}-placeholder` }]);
  const cover = gallery[0];
  const detailGallery = gallery;
  const detailCover = detailGallery[0];
  const area = areaRange(building);
  const floors = building.specifications.find(([label]) => label === "Total floors")?.[1];
  const features = [area, floors ? `${floors} floors` : null].filter((value): value is string => Boolean(value));
  if (!features.length) features.push(building.sector === "Film City" ? "Film City" : `Sector ${building.sector}`, "Office Space");
  const address = building.address ?? (building.sector === "Film City" ? "Film City, Noida, Uttar Pradesh" : `Sector ${building.sector}, Noida, Uttar Pradesh`);
  const nearby: ProjectFact[] = [["Locality", location], ["City", "Noida, Uttar Pradesh"]];
  if (building.nearestMetro) nearby.unshift(["Nearest metro", building.nearestMetro]);
  const overview: ProjectFact[] = [["Building", building.name], ["Location", location], ["Property type", "Commercial office space"], ["Rent", "Price on request"]];
  if (area) overview.push(["Office sizes", area]);
  if (building.spaceType) overview.push(["Workspace format", building.spaceType]);
  const information: ProjectFact[] = [["Building name", building.name], ["Location", location], ...building.specifications.map(([label, value]): ProjectFact => [label, value])];
  if (building.source.status !== "matched") information.push(["Specifications", "Available on request"]);
  return {
    id: building.slug,
    slug: building.slug,
    aliases: [...new Set([...building.aliases, ...(legacyAliases[building.slug] ?? [])])],
    name: building.name,
    location: "noida",
    locationLabel: location,
    type: "commercial",
    category: "Commercial",
    badge: "Enquire Now",
    price: null,
    spaceType: building.spaceType ?? undefined,
    finishedTypes: building.finishedTypes as FinishedType[],
    features,
    amenities: building.amenities,
    cover,
    detail: {
      description: describeBuilding(building),
      overview,
      building: information,
      amenities: building.amenities,
      gallery: detailGallery,
      spaces: [
        {
          id: `${building.slug}-conventional`,
          title: "Conventional office",
          location: `${building.name} · ${location}`,
          description: `Discuss a dedicated office lease at ${building.name}${area ? `, with listed office sizes of ${area}` : ""}. Enquire for current layouts and leasing terms.`,
          badge: "Conventional",
          image: detailCover,
        },
        {
          id: `${building.slug}-commercial`,
          title: "Commercial space",
          location: `${building.name} · ${location}`,
          description: `Discuss your business space requirements at ${building.name}. Enquire for suitable configurations and current availability.`,
          badge: "Commercial",
          image: detailGallery[1] ?? detailCover,
        },
        {
          id: `${building.slug}-coworking`,
          title: "Coworking space",
          location: `${building.name} · ${location}`,
          description: `Ask about coworking options at ${building.name}, including shared desks and private team spaces. Contact our team to confirm availability and terms.`,
          badge: "Coworking",
          image: detailGallery[2] ?? detailCover,
        },
      ],
      location: {
        address,
        caption: `${building.name}\n${address}`,
        directionsQuery: `${building.name}, ${address}`,
        coordinates: building.coordinates ?? undefined,
        map: propertyPlaceholder,
        nearby,
      },
      views: suppliedMedia?.views ?? { exterior: cover, interior: gallery[1] ?? cover },
      photoViewsOnly: true,
      startingPrice: "Price on request",
      startingPriceUnit: "",
      highlights: [location, area ? `Office sizes: ${area}` : "Office configurations on request", "Contact our team for leasing details"],
      benefits: [
        { title: "Workspace Guidance", description: "Discuss your team size, preferred office format and location with PropMentors." },
        { title: "Leasing Details", description: "Request current availability, rental terms and building specifications for your requirements." },
        { title: "Site Visits", description: "Ask our team to arrange a visit and help you evaluate your options." },
      ],
      similarProjectIds: [...buildingResearch.filter((item) => item.slug !== building.slug && item.sector === building.sector), ...buildingResearch.filter((item) => item.slug !== building.slug && item.sector !== building.sector)].slice(0, 3).map((item) => item.slug),
    },
  };
});

export function getProject(slugOrId: string): Project | undefined {
  return projects.find((project) => project.slug === slugOrId || project.id === slugOrId || project.aliases?.includes(slugOrId));
}
