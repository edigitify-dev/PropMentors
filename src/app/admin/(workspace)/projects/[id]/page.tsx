import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { findAdminProject, getAdminProjects } from "@/lib/project-repository";
import { ProjectEditor } from "@/components/admin/project-editor";
export const metadata = { title: "Edit project" };
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = await findAdminProject(id);
  if (!project) notFound();
  return <ProjectEditor key={id} initial={project} related={(await getAdminProjects()).map(({ project }) => ({ id: project.id, name: project.name }))} />;
}
