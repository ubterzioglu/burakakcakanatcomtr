import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import pg from "pg";

async function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  const raw = await fs.readFile(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

await loadEnvFile();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

const sqlPath = path.join(process.cwd(), "supabase", "schema.sql");
const sql = await fs.readFile(sqlPath, "utf8");

await client.connect();
await client.query(sql);
await client.end();

console.log("Supabase schema applied successfully.");
