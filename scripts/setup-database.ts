import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Pool } from "pg";
import { projects } from "../src/data/projects";
import { defaultContactDetails } from "../src/lib/admin-types";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Add DATABASE_URL to .env.local first.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
    const client = await pool.connect();
    let imported = 0;
    try {
      await client.query("BEGIN");
      for (const project of projects) {
        const result = await client.query(
          "INSERT INTO projects (id, slug, name, location, space_type, status, payload) VALUES ($1,$2,$3,$4,$5,'published',$6) ON CONFLICT DO NOTHING",
          [project.id, project.slug, project.name, project.location, project.spaceType ?? project.category, JSON.stringify(project)],
        );
        imported += result.rowCount ?? 0;
      }
      await client.query("INSERT INTO contact_settings (id, payload) VALUES (1, $1) ON CONFLICT DO NOTHING", [JSON.stringify(defaultContactDetails)]);
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
    console.log(`Database ready. Imported ${imported} projects; existing content was preserved.`);
  } finally { await pool.end(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
