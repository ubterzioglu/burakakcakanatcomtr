// One-off script: copies akcakanat_domains rows from the legacy Supabase
// project (env.local.ubterzioglu) into this repo's target project
// (.env.local). Safe to re-run — upserts on the unique `site` column.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(relativePath) {
  const fullPath = join(__dirname, "..", relativePath);
  const content = readFileSync(fullPath, "utf8");
  const values = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    values[key] = value;
  }
  return values;
}

const sourceEnv = loadEnvFile("env.local.ubterzioglu");
const targetEnv = loadEnvFile(".env.local");

const sourceUrl = sourceEnv.NEXT_PUBLIC_SUPABASE_URL;
const sourceKey = sourceEnv.SUPABASE_SERVICE_ROLE_KEY;
const targetUrl = targetEnv.NEXT_PUBLIC_SUPABASE_URL;
const targetKey = targetEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!sourceUrl || !sourceKey) {
  throw new Error("Missing source Supabase credentials in env.local.ubterzioglu");
}
if (!targetUrl || !targetKey) {
  throw new Error("Missing target Supabase credentials in .env.local");
}
if (sourceUrl === targetUrl) {
  throw new Error("Source and target Supabase projects are identical — refusing to run");
}

const sourceClient = createClient(sourceUrl, sourceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const targetClient = createClient(targetUrl, targetKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const COLUMNS =
  "site, domain_info, hosting, email, has_email, redirect_to, payment_days, payment_method, comment, priority, sort_order";

async function main() {
  const { data: rows, error: readError } = await sourceClient
    .from("akcakanat_domains")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });

  if (readError) {
    throw new Error(`Failed to read source rows: ${readError.message}`);
  }
  if (!rows || rows.length === 0) {
    throw new Error("No rows found in source akcakanat_domains table");
  }

  console.log(`Read ${rows.length} rows from source project.`);

  const { error: writeError, data: written } = await targetClient
    .from("akcakanat_domains")
    .upsert(rows, { onConflict: "site" })
    .select("site");

  if (writeError) {
    throw new Error(`Failed to write target rows: ${writeError.message}`);
  }

  console.log(`Upserted ${written?.length ?? 0} rows into target project:`);
  for (const row of written ?? []) {
    console.log(`  - ${row.site}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
