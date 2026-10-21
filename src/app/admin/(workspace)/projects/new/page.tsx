import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProjects } from "@/lib/project-repository";
import { newProject } from "@/lib/new-project";
import { ProjectEditor } from "@/components/admin/project-editor";
export const metadata = { title: "New project" };
export default async function NewProjectPage() {
  await requireAdmin();
  const now = new Date().toISOString();
  return <ProjectEditor isNew initial={{ project: newProject(randomUUID()), status: "draft", createdAt: now, updatedAt: now }} related={(await getAdminProjects()).map(({ project }) => ({ id: project.id, name: project.name }))} />;
}
