import "server-only";
import { cache } from "react";
import { database } from "./db";
import type { Project } from "@/lib/project-types";
import type { AdminProject, ContactDetails, Enquiry } from "./admin-types";

type ProjectRow = { payload: Project; status: AdminProject["status"]; created_at: Date; updated_at: Date };
function toAdminProject(row: ProjectRow): AdminProject {
  return { project: row.payload, status: row.status, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() };
}

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  const { rows } = await database().query<{ payload: Project }>("SELECT payload FROM projects WHERE status = 'published' ORDER BY created_at, id");
  return rows.map((row) => row.payload);
});

export const findPublishedProject = cache(async (slugOrId: string): Promise<Project | undefined> => {
  const { rows } = await database().query<{ payload: Project }>(
    "SELECT payload FROM projects WHERE status = 'published' AND (slug = $1 OR id = $1 OR payload->'aliases' ? $1) LIMIT 1", [slugOrId],
  );
  return rows[0]?.payload;
});

export async function getAdminProjects(): Promise<AdminProject[]> {
  const { rows } = await database().query<ProjectRow>("SELECT payload, status, created_at, updated_at FROM projects ORDER BY updated_at DESC, name");
  return rows.map(toAdminProject);
}

export async function findAdminProject(id: string): Promise<AdminProject | undefined> {
  const { rows } = await database().query<ProjectRow>("SELECT payload, status, created_at, updated_at FROM projects WHERE id = $1", [id]);
  return rows[0] ? toAdminProject(rows[0]) : undefined;
}

export const getContactDetails = cache(async (): Promise<ContactDetails> => {
  const { rows } = await database().query<{ payload: ContactDetails }>("SELECT payload FROM contact_settings WHERE id = 1");
  if (!rows[0]) throw new Error("Contact settings are missing. Run npm run db:setup.");
  return rows[0].payload;
});

export async function getEnquiries(): Promise<Enquiry[]> {
  const { rows } = await database().query(
    "SELECT e.*, p.name AS project_name FROM enquiries e LEFT JOIN projects p ON e.project_id = p.id ORDER BY e.created_at DESC",
  );
  return rows.map((row) => ({
    id: row.id, name: row.name, email: row.email, phone: row.phone, subject: row.subject, message: row.message,
    source: row.source, projectId: row.project_id, projectName: row.project_name, status: row.status, notes: row.notes,
    createdAt: row.created_at.toISOString(),
  }));
}
