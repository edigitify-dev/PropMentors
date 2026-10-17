import catalog from "./building-catalog.json";

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

// Authoritative inventory/order: public/Building sheet.xlsx. See the import report
// for matched EstateLion pages and rows still awaiting building-specific facts.
export const buildingResearch: BuildingRecord[] = catalog;
