import { database } from "@/lib/db";
import { adminMutation, ApiError, apiResponse, readJson } from "@/lib/api-utils";
import { projectInputSchema } from "@/lib/admin-validation";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return apiResponse(async () => {
    await adminMutation(request);
    const { id } = await params;
    const { project, status, updatedAt } = await readJson(request, projectInputSchema);
    if (project.id !== id || !updatedAt) throw new ApiError(400, "The project reference and saved version are required.");
    const client = await database().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(83749202)");
      const previous = await client.query("SELECT slug FROM projects WHERE id = $1 FOR UPDATE", [id]);
      if (!previous.rows[0]) throw new ApiError(404, "Project not found.");
      if (previous.rows[0].slug !== project.slug) project.aliases = [...new Set([...(project.aliases ?? []), previous.rows[0].slug])];
      const names = [project.id, project.slug, ...(project.aliases ?? [])];
      const collision = await client.query("SELECT id FROM projects WHERE id <> $2 AND (slug = ANY($1::text[]) OR id = ANY($1::text[]) OR payload->'aliases' ?| $1::text[]) LIMIT 1", [names, id]);
      if (collision.rowCount) throw new ApiError(409, "This URL or reference belongs to another project.");
      const result = await client.query(
        "UPDATE projects SET slug=$2, name=$3, location=$4, space_type=$5, status=$6, payload=$7, updated_at=date_trunc('milliseconds',now()) WHERE id=$1 AND date_trunc('milliseconds',updated_at)=$8::timestamptz RETURNING updated_at",
        [id, project.slug, project.name, project.location, project.spaceType ?? project.category, status, JSON.stringify(project), updatedAt],
      );
      if (!result.rowCount) throw new ApiError(409, "Someone else updated this project. Reload the page before saving.");
      await client.query("COMMIT");
      revalidatePath("/", "layout");
      return Response.json({ id, project, updatedAt: result.rows[0].updated_at.toISOString() });
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  });
}
