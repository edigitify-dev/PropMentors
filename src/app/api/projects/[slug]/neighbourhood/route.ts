import { findPublishedProject, getPublishedProjects } from "@/lib/project-repository";
import research from "../../../../../data/neighbourhood-places.json";
import {
  nearbyPlacesFor, neighbourhoodRadius,
  type NearbyPlace, type NeighbourhoodData,
} from "../../../../../lib/neighbourhood";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await findPublishedProject(slug);
  if (!project) return Response.json({ error: "Property not found" }, { status: 404 });

  const origin = project.detail.location.coordinates;
  if (!origin) {
    return Response.json({ places: [], radius: neighbourhoodRadius, availability: "no-coordinates" } satisfies NeighbourhoodData);
  }

  // Published, dated landmark research lives on the server. Each property's
  // distances are calculated from its own verified coordinates, never copied
  // from another building or invented when a location is missing.
  const offices: Omit<NearbyPlace, "distance">[] = (await getPublishedProjects()).flatMap(other => {
    const coords = other.detail.location.coordinates;
    return other.id !== project.id && coords
      ? [{ id: `project-${other.id}`, name: other.name, category: "business", type: "Offices", ...coords }]
      : [];
  });
  const landmarks = research.places as Omit<NearbyPlace, "distance">[];
  const places = nearbyPlacesFor([...offices, ...landmarks], origin)
    .filter(place => place.distance > 200 || place.name.toLowerCase() !== project.name.toLowerCase());
  return Response.json({ places, radius: neighbourhoodRadius, availability: "ready" } satisfies NeighbourhoodData, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
