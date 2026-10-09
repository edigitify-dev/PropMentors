import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "../../../components/project-detail";
import { getProject, projects } from "../../../data/projects";

type RouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return {
    title: `${project.name} | PropMentors`,
    description: project.detail.description,
  };
}

export function generateStaticParams() {
  return projects.flatMap((project) => [project.slug, project.id, ...(project.aliases ?? [])].map((slug) => ({ slug })));
}

export default async function ProjectDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail key={project.id} project={project} />;
}
