import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { isDeepStrictEqual } from "node:util";
import { Pool } from "pg";
import duplicateProjects from "../src/data/project-duplicates.json";
import { projectSchema } from "../src/lib/admin-validation";
import type { Project } from "../src/lib/project-types";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const duplicates: Record<string, string> = duplicateProjects;
type ProjectRow = { id: string; slug: string; payload: Project; status: string };

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
  const apply = process.argv.includes("--apply");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(83749202)");
    const { rows } = await client.query<ProjectRow>("SELECT * FROM projects ORDER BY id FOR UPDATE");
    const byId = new Map(rows.map((row) => [row.id, row]));
    const removed = rows.filter((row) => duplicates[row.id]);
    for (const row of removed) {
      const keeper = byId.get(duplicates[row.id]);
      if (!keeper || keeper.status !== "published") throw new Error(`Missing published replacement for ${row.id}`);
      if ([row.payload.cover, ...row.payload.detail.gallery].some((image) => image.src !== "/images/spaces/property-placeholder.svg")) {
        throw new Error(`${row.id} has photographs; review it before merging.`);
      }
    }
    const changes = rows.filter((row) => !duplicates[row.id]).flatMap((row) => {
      const merged = removed.filter((item) => duplicates[item.id] === row.id);
      const project: Project = {
        ...row.payload,
        ...(merged.length ? { aliases: [...new Set([
          ...(row.payload.aliases ?? []),
          ...merged.flatMap((item) => [item.id, item.slug, ...(item.payload.aliases ?? [])]),
        ])] } : {}),
        detail: {
          ...row.payload.detail,
          similarProjectIds: [...new Set(row.payload.detail.similarProjectIds.map((id) => duplicates[id] ?? id))]
            .filter((id) => id !== row.id),
        },
      };
      projectSchema.parse(project);
      return isDeepStrictEqual(project, row.payload) ? [] : [{ row, project }];
    });
    const retained = rows.filter((row) => !duplicates[row.id]);
    const identifiers = new Map<string, string>();
    for (const row of retained) {
      const project = changes.find((change) => change.row.id === row.id)?.project ?? row.payload;
      for (const identifier of [project.id, project.slug, ...(project.aliases ?? [])]) {
        const owner = identifiers.get(identifier);
        if (owner && owner !== project.id) throw new Error(`Conflicting project alias: ${identifier}`);
        identifiers.set(identifier, project.id);
      }
    }
    const removedIds = removed.map((row) => row.id);
    const enquiries = await client.query("SELECT id, project_id FROM enquiries WHERE project_id = ANY($1::text[]) FOR UPDATE", [removedIds]);
    if (apply && (removed.length || changes.length)) {
      const directory = await mkdtemp(path.join(tmpdir(), "propmentor-project-deduplication-"));
      const backup = path.join(directory, "before.json");
      await writeFile(backup, JSON.stringify({ projects: [...removed, ...changes.map(({ row }) => row)], enquiries: enquiries.rows }, null, 2) + "\n", { mode: 0o600 });
      console.log(`Backup: ${backup}`);
      for (const { row, project } of changes) {
        await client.query("UPDATE projects SET payload=$2, updated_at=date_trunc('milliseconds',now()) WHERE id=$1", [row.id, JSON.stringify(project)]);
      }
      for (const row of removed) {
        await client.query("UPDATE enquiries SET project_id=$2 WHERE project_id=$1", [row.id, duplicates[row.id]]);
      }
      await client.query("DELETE FROM projects WHERE id = ANY($1::text[])", [removedIds]);
    }
    await client.query(apply ? "COMMIT" : "ROLLBACK");
    console.log(`${apply ? "Removed" : "Would remove"} ${removed.length} duplicates; ${retained.length} projects remain. ${enquiries.rowCount} enquiries preserved; ${changes.length} records need aliases or related-project updates.`);
    for (const row of removed) console.log(`  ${row.id} -> ${duplicates[row.id]}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
