export const neighbourhoodCategories = [
  { id: "connectivity", label: "Connectivity", types: ["Metro & rail", "Bus stops"] },
  { id: "business", label: "Business", types: ["Offices", "Banks"] },
  { id: "dining", label: "Dining", types: ["Restaurants", "Cafés"] },
  { id: "hospitality", label: "Hospitality", types: ["Hotels", "Guest houses"] },
  { id: "shopping", label: "Shopping", types: ["Malls", "Supermarkets"] },
] as const;

export type NeighbourhoodCategory = (typeof neighbourhoodCategories)[number]["id"];
export type Coordinates = { lat: number; lng: number };
export type NearbyPlace = Coordinates & {
  id: string;
  name: string;
  category: NeighbourhoodCategory;
  type: string;
  distance: number;
};
export type NeighbourhoodData = {
  places: NearbyPlace[];
  radius: number;
  availability: "ready" | "unavailable" | "no-coordinates";
};

export const neighbourhoodRadius = 5000;

/** Great-circle distance in metres, never a road distance or journey time. */
export function distanceBetween(from: Coordinates, to: Coordinates) {
  const radians = (value: number) => value * Math.PI / 180;
  const a = Math.sin(radians(to.lat - from.lat) / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat))
    * Math.sin(radians(to.lng - from.lng) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.max(10, Math.round(metres / 10) * 10)} m` : `${(metres / 1000).toFixed(1)} km`;
}

export function placeDirectionsUrl(place: NearbyPlace, origin?: Coordinates) {
  const query = new URLSearchParams({ api: "1", destination: `${place.lat},${place.lng}` });
  if (origin) query.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${query}`;
}

export function nearbyPlacesFor(elements: Omit<NearbyPlace, "distance">[], origin: Coordinates): NearbyPlace[] {
  const places: NearbyPlace[] = [];
  for (const element of elements) {
    const { lat, lng, category } = element;
    const name = element.name.trim();
    if (!name || !neighbourhoodCategories.some(item => item.id === category) || typeof lat !== "number" || typeof lng !== "number"
      || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    const distance = Math.round(distanceBetween(origin, { lat, lng }));
    if (distance > neighbourhoodRadius) continue;
    // A landmark can appear in research for several neighbouring properties.
    if (places.some(place => place.category === category
      && place.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      && distanceBetween(place, { lat, lng }) < 200)) continue;
    places.push({ ...element, name, distance });
  }
  return places.sort((a, b) => a.distance - b.distance);
}
