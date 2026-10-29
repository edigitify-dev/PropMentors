import { getPublishedProjects } from "@/lib/project-repository";
import { emptyListingFilters, matchesListing } from "@/lib/project-listing-filters";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (query.length < 2 || query.length > 160) return Response.json({ suggestions: [] });

  const projects = await getPublishedProjects();
  const suggestions = projects
    .filter((project) => matchesListing(project, { ...emptyListingFilters, query }))
    .slice(0, 6)
    .map(({ id, slug, name, locationLabel }) => ({ id, slug, name, locationLabel }));
  return Response.json({ suggestions });
}
