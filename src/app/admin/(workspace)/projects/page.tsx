import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProjects } from "@/lib/project-repository";
import { ProjectsTable } from "@/components/admin/projects-table";
export const metadata = { title: "Projects" };
export default async function AdminProjectsPage() { await requireAdmin(); return <ProjectsTable projects={await getAdminProjects()} />; }
