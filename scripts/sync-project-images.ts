import { mkdtemp, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { isDeepStrictEqual } from "node:util";
import { Pool } from "pg";
import { getProjectMedia } from "../src/data/project-images-data";
import { projectSchema } from "../src/lib/admin-validation";
import type { Project } from "../src/lib/project-types";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
  const apply = process.argv.includes("--apply");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string; payload: Project; updated_at: Date }>(
      `SELECT id, payload, updated_at FROM projects ORDER BY id${apply ? " FOR UPDATE" : ""}`,
    );
    const changes = [];
    for (const row of rows) {
      const media = getProjectMedia(row.id, row.payload.name);
      if (!media) continue;
      for (const image of media.gallery) {
        if (image.src.startsWith("/")) await access(path.join(process.cwd(), "public", decodeURIComponent(image.src)));
      }
      const project: Project = {
        ...row.payload,
        cover: media.cover,
        detail: {
          ...row.payload.detail,
          gallery: media.gallery,
          views: { ...media.views, floorPlan: row.payload.detail.views.floorPlan },
          spaces: row.payload.detail.spaces.map((space, index) => ({
            ...space, image: media.gallery[index] ?? media.cover,
          })),
        },
      };
      projectSchema.parse(project);
      // PostgreSQL jsonb reorders keys, and JSON omits optional undefined fields.
      if (!isDeepStrictEqual(JSON.parse(JSON.stringify(project)), row.payload)) changes.push({ row, project });
    }
    if (apply && changes.length) {
      const backupDirectory = await mkdtemp(path.join(tmpdir(), "propmentor-project-images-"));
      const backup = path.join(backupDirectory, "before.json");
      await writeFile(backup, JSON.stringify(changes.map(({ row }) => row), null, 2) + "\n", { mode: 0o600 });
      console.log(`Original project records saved to ${backup}`);
      for (const { row, project } of changes) {
        await client.query(
          "UPDATE projects SET payload=$2, updated_at=date_trunc('milliseconds',now()) WHERE id=$1",
          [row.id, JSON.stringify(project)],
        );
      }
    }
    await client.query(apply ? "COMMIT" : "ROLLBACK");
    console.log(`${apply ? "Updated" : "Would update"} ${changes.length} projects; other project fields and publication status are preserved.`);
    for (const { project } of changes) console.log(`  ${project.id}: ${project.detail.gallery.length} photographs`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
