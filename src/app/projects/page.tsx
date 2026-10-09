import type { Metadata } from "next";
import { ProjectPage } from "@/components/project-page";

export const metadata: Metadata = {
  title: "Find your space | PropMentors",
  description: "Explore curated commercial spaces across locations, formats and budgets — all in one place.",
};

export default async function ProjectsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const initialFilters = Object.fromEntries(
    ["spaceType", "location", "budget"].map((key) => [key, typeof query[key] === "string" ? query[key] : undefined]),
  );
  return <ProjectPage initialFilters={initialFilters} />;
}
