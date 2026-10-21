import { database } from "@/lib/db";
import { adminMutation, ApiError, apiResponse, readJson } from "@/lib/api-utils";
import { projectInputSchema } from "@/lib/admin-validation";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  return apiResponse(async () => {
    await adminMutation(request);
    const data = await readJson(request, projectInputSchema);
    const client = await database().connect();
    const { project, status } = data;
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(83749202)");
      const names = [project.id, project.slug, ...(project.aliases ?? [])];
      const collision = await client.query("SELECT id FROM projects WHERE slug = ANY($1::text[]) OR id = ANY($1::text[]) OR payload->'aliases' ?| $1::text[] LIMIT 1", [names]);
      if (collision.rowCount) throw new ApiError(409, "This URL or reference belongs to another project.");
      await client.query("INSERT INTO projects (id, slug, name, location, space_type, status, payload) VALUES ($1,$2,$3,$4,$5,$6,$7)", [project.id, project.slug, project.name, project.location, project.spaceType ?? project.category, status, JSON.stringify(project)]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
    revalidatePath("/", "layout");
    return Response.json({ id: project.id }, { status: 201 });
  });
}
