import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "../../../components/project-detail";
import { findPublishedProject, getPublishedProjects } from "@/lib/project-repository";

type RouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await findPublishedProject(slug);
  if (!project) notFound();
  return {
    title: `${project.name} | PropMentors`,
    description: project.detail.description,
  };
}

export default async function ProjectDetailPage({ params, searchParams }: RouteProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const listingHref = typeof returnTo === "string" && /^\/projects(?:[?#]|$)/.test(returnTo) ? returnTo : "/projects";
  const project = await findPublishedProject(slug);
  if (!project) notFound();
  const published = await getPublishedProjects();
  const similarProjects = project.detail.similarProjectIds.flatMap((id) => {
    const related = published.find((item) => item.id === id && item.id !== project.id);
    return related ? [related] : [];
  });
  return <ProjectDetail key={project.id} project={project} similarProjects={similarProjects} listingHref={listingHref} />;
}
