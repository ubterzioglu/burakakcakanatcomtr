// One-off script: applies the three akcakanat_domains migration files
// directly via `pg`, since scripts/setup-database.mjs only applies
// supabase/schema.sql and psql may not be installed locally.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pg from "pg";

async function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = await fs.readFile(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

await loadEnvFile();

const files = [
  "20260703090000_create_akcakanat_domains.sql",
  "20260703110000_add_priority_to_akcakanat_domains.sql",
  "20260705120000_add_ops_columns_to_akcakanat_domains.sql"
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  for (const file of files) {
    const filePath = path.join(process.cwd(), "supabase", "migrations", file);
    const sql = await fs.readFile(filePath, "utf8");
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`  OK`);
  }
} finally {
  await client.end();
}

console.log("All akcakanat_domains migrations applied.");
