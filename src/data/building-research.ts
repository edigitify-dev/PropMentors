import catalog from "./building-catalog.json";
import duplicateProjects from "./project-duplicates.json";

export type BuildingRecord = {
  sheetRow: number;
  name: string;
  sector: string;
  slug: string;
  aliases: string[];
  source: {
    url: string | null;
    name: string | null;
    status: string;
    checkedAt: string;
    note: string | null;
  };
  address: string | null;
  specifications: string[][];
  amenities: string[];
  photos: { src: string; width: number; height: number; sourceUrl: string }[];
  units: { area: number; workstations: number | null }[];
  spaceType: string | null;
  finishedTypes: string[];
  minArea: number | null;
  maxArea: number | null;
  nearestMetro: string | null;
  coordinates: { lat: number; lng: number } | null;
};

// Keep the source spreadsheet intact; reviewed duplicates are excluded from the
// inventory and their old URLs remain aliases of the complete building record.
const duplicates: Record<string, string> = duplicateProjects;
export const buildingResearch: BuildingRecord[] = catalog
  .filter((building) => !duplicates[building.slug])
  .map((building) => ({
    ...building,
    aliases: [...new Set([
      ...building.aliases,
      ...catalog.filter((item) => duplicates[item.slug] === building.slug)
        .flatMap((item) => [item.slug, ...item.aliases]),
    ])],
  }));
