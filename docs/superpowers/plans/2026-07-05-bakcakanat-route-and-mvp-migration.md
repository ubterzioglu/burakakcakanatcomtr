# Bakcakanat Route Port + MVP Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `/bakcakanat` domain-management admin board verbatim from `github.com/ubterzioglu/ubt2026`, migrate its 14 existing domain rows into this project's Supabase database, then move all current public routes under `/mvp` and replace the homepage with a premium "coming soon" page.

**Architecture:** `/bakcakanat` is a fully self-contained admin board — its own password-gated cookie auth (`BAKCAKANAT_PASSWORD`), its own Supabase table (`akcakanat_domains`), its own theme tokens. It does not touch the existing `lib/auth.ts` admin system. After it's ported and working, every existing public page (`/`, `/insights`, `/insights/[slug]`, `/ventures/[slug]`, `/contact`) moves to `/mvp/*` via folder relocation (imports/links updated in place — no route groups, no rewrites). `/admin` and `/api` stay exactly where they are. The homepage (`/`) becomes a new static "coming soon" page.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Supabase (`@supabase/supabase-js`), Zod, Tailwind CSS v4, Vitest, Playwright.

## Global Constraints

- Port `/bakcakanat` files verbatim from `ubterzioglu/ubt2026` — no redesign, no refactor, only path/import adjustments needed to fit this repo.
- Do not modify `lib/auth.ts`, `lib/env.ts` shape, or the existing `/admin` gate — `/bakcakanat` auth is fully independent (`BAKCAKANAT_PASSWORD` env var, its own cookie).
- Target Supabase project for all writes (including migrated data) is the project already configured in this repo's `.env.local` (`NEXT_PUBLIC_SUPABASE_URL=https://hzublcpsebpckfduocii.supabase.co`) — NOT the `env.local.ubterzioglu` project. The old project is a one-time read-only data source.
- `env.local.ubterzioglu` must never be committed — add it to `.gitignore` even though it's currently untracked.
- `/admin` and `/api` routes keep their current URLs — do not move them under `/mvp`.
- Homepage "coming soon" page must be "süper premium" — high visual polish, consistent with the existing dark/gold marketing aesthetic (see `app/globals.css`, `display-title`, `kicker`, `#d4b06a` gold accent).
- All internal links inside migrated MVP pages must be updated to the new `/mvp` prefix so in-app navigation doesn't 404.
- Run `npm run typecheck` and `npm run lint` after each task that touches `.ts`/`.tsx` files.

---

### Task 1: Add `BAKCAKANAT_PASSWORD` env var and ignore the legacy env file

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `process.env.BAKCAKANAT_PASSWORD` available to later tasks' auth code.

- [ ] **Step 1: Add the password to `.env.local`**

Append this line to `c:\temp_private\burakakcakanat\.env.local`:

```
BAKCAKANAT_PASSWORD=Burakubt2026**
```

- [ ] **Step 2: Add the placeholder to `.env.example`**

Append this line to `c:\temp_private\burakakcakanat\.env.example`:

```
BAKCAKANAT_PASSWORD=change-me
```

- [ ] **Step 3: Ignore the legacy credentials file**

Append this line to `c:\temp_private\burakakcakanat\.gitignore`:

```
env.local.ubterzioglu
```

- [ ] **Step 4: Verify it's ignored**

Run: `git status --porcelain -- env.local.ubterzioglu`
Expected: no output (file no longer shows as untracked)

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add BAKCAKANAT_PASSWORD placeholder and ignore legacy env file"
```

Note: `.env.local` is already gitignored, so it is not staged/committed — only `.env.example` and `.gitignore` are.

---

### Task 2: Create the `akcakanat_domains` table via migrations

**Files:**
- Create: `supabase/migrations/20260703090000_create_akcakanat_domains.sql`
- Create: `supabase/migrations/20260703110000_add_priority_to_akcakanat_domains.sql`
- Create: `supabase/migrations/20260705120000_add_ops_columns_to_akcakanat_domains.sql`

**Interfaces:**
- Produces: Postgres table `public.akcakanat_domains` with columns `id, site, domain_info, hosting, email, has_email, redirect_to, payment_days, payment_method, comment, priority, sort_order, created_at, updated_at`, consumed by `lib/akcakanat-domains.ts` in Task 4.

- [ ] **Step 1: Create the base table migration**

Create `supabase/migrations/20260703090000_create_akcakanat_domains.sql`:

```sql
create extension if not exists "pgcrypto";

-- Domain portfolio board for the Akçakanat sites, managed behind the
-- /bakcakanat gate. Left column lists the site; the editable columns track
-- where the domain is registered, where it is hosted, which email provider is
-- attached and a free-form comment.
-- Admin-managed only; not exposed to anon/authenticated readers.
create table if not exists public.akcakanat_domains (
  id uuid primary key default gen_random_uuid(),
  site text not null unique,
  domain_info text not null default '',
  hosting text not null default '',
  email text not null default '',
  comment text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists akcakanat_domains_sort_idx
  on public.akcakanat_domains (sort_order, created_at);

create or replace function public.set_akcakanat_domain_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_akcakanat_domain_updated_at on public.akcakanat_domains;
create trigger set_akcakanat_domain_updated_at
before update on public.akcakanat_domains
for each row
execute function public.set_akcakanat_domain_updated_at();

-- RLS on, with NO select/insert/update/delete policy for anon/authenticated.
-- All access goes through the service-role client behind the /bakcakanat gate.
alter table public.akcakanat_domains enable row level security;
```

Note: the seed `insert` block from the original migration is intentionally omitted here — Task 3 migrates the real rows from the legacy Supabase project instead of re-seeding placeholder data.

- [ ] **Step 2: Create the priority-column migration**

Create `supabase/migrations/20260703110000_add_priority_to_akcakanat_domains.sql`:

```sql
-- Importance ranking for the /bakcakanat domain board: 1 = most important,
-- 10 = least important. The board lists rows by this value first.
alter table public.akcakanat_domains
  add column if not exists priority integer not null default 5
    check (priority between 1 and 10);

create index if not exists akcakanat_domains_priority_idx
  on public.akcakanat_domains (priority, sort_order, created_at);
```

- [ ] **Step 3: Create the ops-columns migration**

Create `supabase/migrations/20260705120000_add_ops_columns_to_akcakanat_domains.sql`:

```sql
-- Operational tracking columns for the /bakcakanat domain board:
--   has_email      -> does the domain have a mailbox (var/yok)
--   redirect_to    -> forwarding target; empty string means no redirect
--   payment_days   -> renewal/payment due dates (free text)
--   payment_method -> how the domain is paid, e.g. "sanal kart" (free text)
alter table public.akcakanat_domains
  add column if not exists has_email boolean not null default false,
  add column if not exists redirect_to text not null default '',
  add column if not exists payment_days text not null default '',
  add column if not exists payment_method text not null default '';
```

- [ ] **Step 4: Apply the migrations to the target Supabase project**

Run (from repo root, using the DATABASE_URL already in `.env.local`, target project `hzublcpsebpckfduocii`):

```bash
node scripts/setup-database.mjs
```

If `scripts/setup-database.mjs` does not apply raw SQL files under `supabase/migrations`, instead apply them directly with `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260703090000_create_akcakanat_domains.sql
psql "$DATABASE_URL" -f supabase/migrations/20260703110000_add_priority_to_akcakanat_domains.sql
psql "$DATABASE_URL" -f supabase/migrations/20260705120000_add_ops_columns_to_akcakanat_domains.sql
```

Expected: each command exits 0 with no error output.

- [ ] **Step 5: Verify the table exists with all columns**

Run:

```bash
psql "$DATABASE_URL" -c "\d public.akcakanat_domains"
```

Expected: output lists all 14 columns (`id, site, domain_info, hosting, email, comment, sort_order, created_at, updated_at, priority, has_email, redirect_to, payment_days, payment_method`).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260703090000_create_akcakanat_domains.sql supabase/migrations/20260703110000_add_priority_to_akcakanat_domains.sql supabase/migrations/20260705120000_add_ops_columns_to_akcakanat_domains.sql
git commit -m "feat: add akcakanat_domains table migrations"
```

---

### Task 3: Migrate the 14 existing domain rows from the legacy Supabase project

**Files:**
- Create: `scripts/migrate-akcakanat-domains.mjs` (one-off migration script, safe to leave in `scripts/` for reproducibility)

**Interfaces:**
- Consumes: `env.local.ubterzioglu` (legacy source: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) and `.env.local` (target: same var names, different project) — both loaded manually inside the script, not via `lib/env.ts`, since this script talks to two different Supabase projects simultaneously.
- Produces: 14 rows in the target project's `public.akcakanat_domains` table, matching the source data exactly.

- [ ] **Step 1: Write the migration script**

Create `scripts/migrate-akcakanat-domains.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the migration script**

Run: `node scripts/migrate-akcakanat-domains.mjs`

Expected: prints "Read 14 rows from source project." followed by "Upserted 14 rows into target project:" and a list of 14 site names (`corteqs.net`, `getstaketurk.com`, `londonschoolofcoaching.com`, `londonschoolofpsychology.com`, `or-ge.com.tr`, `payaltr.com`, `qualtronsinclair.com`, `turkinvestnetwork.com`, `shamanlife.com`, `bilincsizsiniz.com`, `humanconsciousnessdecoded.com`, `burakakcakanat.com.tr`, `kaanakcakanat.com.tr`, `samanakcakanat.com.tr`).

- [ ] **Step 3: Verify row count in target database**

Run:

```bash
psql "$DATABASE_URL" -c "select count(*) from public.akcakanat_domains;"
```

Expected: `count` is `14`.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-akcakanat-domains.mjs
git commit -m "feat: add one-off script to migrate akcakanat_domains from legacy project"
```

---

### Task 4: Port `lib/admin-auth.ts` (Bakcakanat-only slice) and `lib/akcakanat-domains.ts`

**Files:**
- Create: `lib/admin-auth.ts`
- Create: `lib/akcakanat-domains.ts`
- Test: `lib/admin-auth.test.ts`

**Interfaces:**
- Produces: `isBakcakanatAuthenticated(): Promise<boolean>`, `signInBakcakanat(candidate: string): Promise<boolean>`, `signOutBakcakanat(): Promise<void>` from `lib/admin-auth.ts`.
- Produces: `getAllAkcakanatDomainsAdmin`, `getAkcakanatDomainByIdAdmin`, `createAkcakanatDomain`, `updateAkcakanatDomain`, `deleteAkcakanatDomain`, `clampAkcakanatPriority`, and types `AkcakanatDomainItem`, `AkcakanatDomainInput`, `AkcakanatDomainsResult`, `AkcakanatDomainMutationResult` from `lib/akcakanat-domains.ts`.
- Consumed by: `app/bakcakanat/_actions.ts`, `app/bakcakanat/page.tsx` (Task 5).

This repo has no existing `lib/admin-auth.ts` (it has an unrelated `lib/auth.ts` for the `/admin` gate) — so only the Bakcakanat-specific slice of the upstream file is ported, not the full multi-board file (which also handles `/admin`, `/dm`, `/batubt` gates that don't exist in this repo).

- [ ] **Step 1: Write the failing auth test**

Create `lib/admin-auth.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const COOKIE_STORE = new Map<string, { value: string }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => COOKIE_STORE.get(name),
    set: (name: string, value: string) => {
      COOKIE_STORE.set(name, { value });
    }
  })
}));

describe("bakcakanat auth", () => {
  const ORIGINAL_ENV = process.env.BAKCAKANAT_PASSWORD;

  beforeEach(() => {
    COOKIE_STORE.clear();
    process.env.BAKCAKANAT_PASSWORD = "test-password-123";
  });

  afterEach(() => {
    process.env.BAKCAKANAT_PASSWORD = ORIGINAL_ENV;
  });

  it("rejects sign-in with the wrong password", async () => {
    const { signInBakcakanat } = await import("./admin-auth");
    const ok = await signInBakcakanat("wrong-password");
    expect(ok).toBe(false);
  });

  it("accepts sign-in with the correct password and authenticates after", async () => {
    const { signInBakcakanat, isBakcakanatAuthenticated } = await import(
      "./admin-auth"
    );
    const ok = await signInBakcakanat("test-password-123");
    expect(ok).toBe(true);
    expect(await isBakcakanatAuthenticated()).toBe(true);
  });

  it("fails closed when BAKCAKANAT_PASSWORD is not configured", async () => {
    process.env.BAKCAKANAT_PASSWORD = "";
    const { signInBakcakanat, isBakcakanatAuthenticated } = await import(
      "./admin-auth"
    );
    expect(await signInBakcakanat("anything")).toBe(false);
    expect(await isBakcakanatAuthenticated()).toBe(false);
  });

  it("signs out by clearing the cookie", async () => {
    const { signInBakcakanat, signOutBakcakanat, isBakcakanatAuthenticated } =
      await import("./admin-auth");
    await signInBakcakanat("test-password-123");
    expect(await isBakcakanatAuthenticated()).toBe(true);
    await signOutBakcakanat();
    expect(await isBakcakanatAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/admin-auth.test.ts`
Expected: FAIL — `lib/admin-auth.ts` does not exist yet.

- [ ] **Step 3: Create `lib/admin-auth.ts`**

Create `lib/admin-auth.ts`:

```typescript
import "server-only";

import { cookies } from "next/headers";

/**
 * The Akçakanat domain board (/bakcakanat) has its own password/cookie so it
 * can be shared independently of every other admin key.
 */
export const BAKCAKANAT_ACCESS_COOKIE = "ubt_bakcakanat_access";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Reads the Akçakanat domain-board password (empty string if not configured).
 * No fallback: the board is gated solely by BAKCAKANAT_PASSWORD.
 */
function getBakcakanatPassword(): string {
  return process.env.BAKCAKANAT_PASSWORD?.trim() ?? "";
}

/**
 * True when the current request carries a valid Akçakanat session cookie.
 *
 * Fails CLOSED: if BAKCAKANAT_PASSWORD is not configured (e.g. missing on the
 * production host), nobody gets in — the board must never be publicly
 * reachable just because an env var was forgotten.
 */
export async function isBakcakanatAuthenticated(): Promise<boolean> {
  const password = getBakcakanatPassword();
  if (!password) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(BAKCAKANAT_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === password;
}

/**
 * Validates the supplied password and, when correct, persists it in an
 * HttpOnly cookie scoped to /bakcakanat. Returns whether sign-in succeeded.
 */
export async function signInBakcakanat(candidate: string): Promise<boolean> {
  const password = getBakcakanatPassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the Akçakanat session cookie (sign out).
 *
 * Expires the cookie with the exact attributes used at sign-in instead of
 * `cookies().delete()`: the plain deletion Set-Cookie carries no Secure/
 * HttpOnly/SameSite flags, and browsers can refuse to drop a Secure cookie
 * (set in production over HTTPS) without attribute parity.
 */
export async function signOutBakcakanat(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: 0
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/admin-auth.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Create `lib/akcakanat-domains.ts` verbatim**

Create `lib/akcakanat-domains.ts` (ported as-is from `ubterzioglu/ubt2026`):

```typescript
import "server-only";

import { createClient } from "@supabase/supabase-js";

type SourceState = "remote" | "env-missing" | "empty" | "error";

interface SupabaseAkcakanatDomainRow {
  id: string;
  site: string;
  domain_info: string;
  hosting: string;
  email: string;
  has_email: boolean;
  redirect_to: string;
  payment_days: string;
  payment_method: string;
  comment: string;
  priority: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const AKCAKANAT_DOMAIN_COLUMNS =
  "id, site, domain_info, hosting, email, has_email, redirect_to, payment_days, payment_method, comment, priority, sort_order, created_at, updated_at";

export interface AkcakanatDomainItem {
  id: string;
  site: string;
  domainInfo: string;
  hosting: string;
  email: string;
  /** Whether the domain has a mailbox (var/yok). */
  hasEmail: boolean;
  /** Forwarding target; empty string means no redirect. */
  redirectTo: string;
  /** Renewal/payment due dates, free text. */
  paymentDays: string;
  /** How the domain is paid, e.g. "sanal kart". */
  paymentMethod: string;
  comment: string;
  /** Importance rank: 1 = most important, 10 = least important. */
  priority: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AkcakanatDomainsResult {
  source: SourceState;
  errorMessage?: string;
  items: AkcakanatDomainItem[];
}

export interface AkcakanatDomainInput {
  site: string;
  domainInfo: string;
  hosting: string;
  email: string;
  hasEmail: boolean;
  redirectTo: string;
  paymentDays: string;
  paymentMethod: string;
  comment: string;
  /** Importance rank: 1 = most important, 10 = least important. */
  priority: number;
  sortOrder: number;
}

/** Clamps an importance rank into the 1-10 range (5 when not a number). */
export function clampAkcakanatPriority(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(10, Math.max(1, Math.trunc(value)));
}

export interface AkcakanatDomainMutationResult {
  ok: boolean;
  errorMessage?: string;
}

function toAkcakanatDomainItem(
  row: SupabaseAkcakanatDomainRow
): AkcakanatDomainItem {
  return {
    id: row.id,
    site: row.site,
    domainInfo: row.domain_info ?? "",
    hosting: row.hosting ?? "",
    email: row.email ?? "",
    hasEmail: Boolean(row.has_email),
    redirectTo: row.redirect_to ?? "",
    paymentDays: row.payment_days ?? "",
    paymentMethod: row.payment_method ?? "",
    comment: row.comment ?? "",
    priority: clampAkcakanatPriority(row.priority),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function createServiceClient() {
  const env = getServiceEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * Returns every Akçakanat domain record ordered by importance (1 first), then
 * manual sort_order, then creation time. Admin-only (service-role) access
 * behind the /bakcakanat gate.
 */
export async function getAllAkcakanatDomainsAdmin(): Promise<AkcakanatDomainsResult> {
  const supabase = createServiceClient();
  if (!supabase) return { source: "env-missing", items: [] };
  try {
    const { data, error } = await supabase
      .from("akcakanat_domains")
      .select(AKCAKANAT_DOMAIN_COLUMNS)
      .order("priority", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const items = ((data ?? []) as SupabaseAkcakanatDomainRow[]).map(
      toAkcakanatDomainItem
    );
    return { source: items.length > 0 ? "remote" : "empty", items };
  } catch (error) {
    return {
      source: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      items: []
    };
  }
}

export async function getAkcakanatDomainByIdAdmin(
  id: string
): Promise<AkcakanatDomainItem | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("akcakanat_domains")
      .select(AKCAKANAT_DOMAIN_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return toAkcakanatDomainItem(data as SupabaseAkcakanatDomainRow);
  } catch {
    return null;
  }
}

export async function createAkcakanatDomain(
  input: AkcakanatDomainInput
): Promise<AkcakanatDomainMutationResult> {
  const site = input.site.trim();
  if (site.length < 3) {
    return { ok: false, errorMessage: "Site adı en az 3 karakter olmalı." };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  try {
    const { error } = await supabase.from("akcakanat_domains").insert({
      site,
      domain_info: input.domainInfo.trim(),
      hosting: input.hosting.trim(),
      email: input.email.trim(),
      has_email: input.hasEmail,
      redirect_to: input.redirectTo.trim(),
      payment_days: input.paymentDays.trim(),
      payment_method: input.paymentMethod.trim(),
      comment: input.comment.trim(),
      priority: clampAkcakanatPriority(input.priority),
      sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0
    });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Create failed."
    };
  }
}

export async function updateAkcakanatDomain(
  id: string,
  input: Partial<AkcakanatDomainInput>
): Promise<AkcakanatDomainMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }

  const patch: Record<string, unknown> = {};
  try {
    if (input.site !== undefined) {
      const site = input.site.trim();
      if (site.length < 3) {
        return { ok: false, errorMessage: "Site adı en az 3 karakter olmalı." };
      }
      patch.site = site;
    }
    if (input.domainInfo !== undefined) {
      patch.domain_info = input.domainInfo.trim();
    }
    if (input.hosting !== undefined) patch.hosting = input.hosting.trim();
    if (input.email !== undefined) patch.email = input.email.trim();
    if (input.hasEmail !== undefined) patch.has_email = input.hasEmail;
    if (input.redirectTo !== undefined) {
      patch.redirect_to = input.redirectTo.trim();
    }
    if (input.paymentDays !== undefined) {
      patch.payment_days = input.paymentDays.trim();
    }
    if (input.paymentMethod !== undefined) {
      patch.payment_method = input.paymentMethod.trim();
    }
    if (input.comment !== undefined) patch.comment = input.comment.trim();
    if (input.priority !== undefined) {
      patch.priority = clampAkcakanatPriority(input.priority);
    }
    if (input.sortOrder !== undefined) {
      patch.sort_order = Number.isFinite(input.sortOrder) ? input.sortOrder : 0;
    }

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("akcakanat_domains")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Update failed."
    };
  }
}

export async function deleteAkcakanatDomain(
  id: string
): Promise<AkcakanatDomainMutationResult> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, errorMessage: "Service credentials missing." };
  }
  try {
    const { error } = await supabase
      .from("akcakanat_domains")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : "Delete failed."
    };
  }
}
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: no errors related to `lib/admin-auth.ts` or `lib/akcakanat-domains.ts`.

- [ ] **Step 7: Commit**

```bash
git add lib/admin-auth.ts lib/admin-auth.test.ts lib/akcakanat-domains.ts
git commit -m "feat: port bakcakanat auth and domain-repository lib modules"
```

---

### Task 5: Port the `/bakcakanat` route (page, actions, components)

**Files:**
- Create: `app/bakcakanat/_components/theme.ts`
- Create: `app/bakcakanat/_components/bakcakanat-login.tsx`
- Create: `app/bakcakanat/_actions.ts`
- Create: `app/bakcakanat/page.tsx`

**Interfaces:**
- Consumes: `isBakcakanatAuthenticated`, `signInBakcakanat`, `signOutBakcakanat` from `lib/admin-auth.ts` (Task 4); `getAllAkcakanatDomainsAdmin`, `getAkcakanatDomainByIdAdmin`, `createAkcakanatDomain`, `updateAkcakanatDomain`, `deleteAkcakanatDomain`, `clampAkcakanatPriority`, `AkcakanatDomainItem` from `lib/akcakanat-domains.ts` (Task 4).
- Produces: the `/bakcakanat` page route, reachable in the browser.

- [ ] **Step 1: Create the theme tokens file**

Create `app/bakcakanat/_components/theme.ts`:

```typescript
/**
 * Akçakanat domain-board theme tokens. Palette: black (1) · emerald (2) ·
 * sky blue (3), with white text — deliberately distinct from the BatuBT
 * (yellow/violet) and DesireMap (magenta/cyan) boards. Scoped to the
 * `/bakcakanat` route so it never touches the global site theme.
 */

/** Core accent hexes (kept as named constants so JSX can reference them). */
export const BAKCAKANAT_EMERALD = "#34D399";
export const BAKCAKANAT_SKY = "#38BDF8";

/**
 * Tri-color brand gradient used for borders, the logo tile and the CTA.
 * Emerald-led, resolving into sky blue.
 */
export const BAKCAKANAT_BRAND_GRADIENT =
  "linear-gradient(115deg, #34D399 0%, #2DD4BF 45%, #38BDF8 100%)";

/** Full-page ambient background: emerald glow top-left, sky bottom-right. */
export const BAKCAKANAT_AMBIENT_BACKGROUND =
  "radial-gradient(55% 50% at 16% 10%, rgba(52,211,153,0.18), transparent 60%)," +
  "radial-gradient(48% 48% at 88% 6%, rgba(56,189,248,0.14), transparent 58%)," +
  "radial-gradient(70% 75% at 52% 120%, rgba(45,212,191,0.16), transparent 60%)," +
  "linear-gradient(180deg, #070b0a 0%, #060908 55%, #040606 100%)";

/** Subtle grid texture, masked toward the top so it fades into the glow. */
export const BAKCAKANAT_GRID_TEXTURE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)",
  WebkitMaskImage: "radial-gradient(120% 90% at 50% 18%, black, transparent 75%)"
} as const;
```

- [ ] **Step 2: Create the login component**

Create `app/bakcakanat/_components/bakcakanat-login.tsx`:

```typescript
import {
  BAKCAKANAT_AMBIENT_BACKGROUND,
  BAKCAKANAT_BRAND_GRADIENT,
  BAKCAKANAT_EMERALD,
  BAKCAKANAT_GRID_TEXTURE
} from "@/app/bakcakanat/_components/theme";

interface BakcakanatLoginProps {
  /** Sign-in server action (handles its own redirect). */
  signIn: (formData: FormData) => void | Promise<void>;
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  brand?: string;
  subtitle?: string;
  footerCaption?: string;
}

/**
 * Premium Akçakanat login, mirroring the BatuBT entrance layout: a two-column
 * split pairing a typographic showcase panel (left) with a glass auth card
 * (right), built on the board's black · emerald · sky palette. All treatment
 * is inline so it never touches the global site theme nor the shared admin
 * gate used elsewhere.
 */
export function BakcakanatLogin({
  signIn,
  eyebrow,
  title,
  description,
  submitLabel,
  brand = "Akçakanat",
  subtitle = "Domain Yönetimi",
  footerCaption = "ubterzioglu.de · internal"
}: BakcakanatLoginProps) {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
      style={{ background: BAKCAKANAT_AMBIENT_BACKGROUND }}
    >
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={BAKCAKANAT_GRID_TEXTURE}
      />
      {/* Floating brand orbs */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(52,211,153,0.28)" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 bottom-8 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(56,189,248,0.28)" }}
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-[150px]"
        style={{ background: "rgba(45,212,191,0.16)" }}
      />

      {/* Card shell with brand gradient border */}
      <div
        className="animate-reveal w-full max-w-5xl rounded-[2rem] p-[1.5px] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]"
        style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
      >
        <div className="grid overflow-hidden rounded-[1.92rem] bg-[#060908]/90 backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          {/* Left showcase — typographic panel (no artwork asset for this board) */}
          <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 60% at 30% 25%, rgba(52,211,153,0.20), transparent 65%)," +
                  "radial-gradient(60% 55% at 80% 85%, rgba(56,189,248,0.22), transparent 60%)," +
                  "linear-gradient(180deg, #081210 0%, #060d0c 60%, #050a09 100%)"
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={BAKCAKANAT_GRID_TEXTURE}
            />
            <div className="relative flex h-full flex-col justify-between p-10">
              <div className="flex items-center gap-3">
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/20"
                  style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
                >
                  <span className="font-body text-lg font-extrabold tracking-tight text-black">
                    A
                  </span>
                </span>
                <div className="leading-tight">
                  <p className="font-body text-sm font-bold tracking-tight text-white">
                    {brand}
                  </p>
                  <p className="text-[11px] font-medium text-white/45">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div>
                <p
                  className="font-body text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white"
                >
                  Domain
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
                  >
                    portföyü
                  </span>
                </p>
                <p className="mt-4 max-w-xs text-[13px] leading-6 text-white/50">
                  Tüm alan adları, hosting ve e-posta kayıtları tek panoda —
                  düzenlenebilir ve güncel.
                </p>
              </div>

              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
                {footerCaption}
              </p>
            </div>
            {/* Inner edge sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
            />
          </div>

          {/* Right side — form + info */}
          <div className="relative px-7 py-9 sm:px-10 sm:py-11">
            {/* Top sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.40), transparent)"
              }}
            />

            {/* Mobile brand (left showcase hidden on small screens) */}
            <div className="mb-8 flex items-center justify-between lg:mb-9">
              <div className="flex items-center gap-3 lg:hidden">
                <span
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/20"
                  style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
                >
                  <span className="font-body text-base font-extrabold tracking-tight text-black">
                    A
                  </span>
                </span>
                <div className="leading-tight">
                  <p className="font-body text-sm font-bold tracking-tight text-white">
                    {brand}
                  </p>
                  <p className="text-[11px] font-medium text-white/45">
                    {subtitle}
                  </p>
                </div>
              </div>
              <span
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: "rgba(52,211,153,0.35)",
                  background: "rgba(52,211,153,0.10)",
                  color: BAKCAKANAT_EMERALD
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: "rgba(52,211,153,0.7)" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: BAKCAKANAT_EMERALD }}
                  />
                </span>
                Secure
              </span>
            </div>

            {/* Headline */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.34em]"
              style={{ color: "#7dd3fc" }}
            >
              {eyebrow}
            </p>
            <h1 className="mt-3 font-body text-[clamp(1.55rem,4vw,2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
              {title}
            </h1>
            <p className="mt-3 text-[13px] leading-6 text-white/55">
              {description}
            </p>

            {/* Form */}
            <form action={signIn} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Şifre
                </span>
                <div className="group relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-[#34D399]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    name="access"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full rounded-[1.05rem] border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#34D399]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#34D399]/15"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[1.05rem] px-6 py-3.5 text-sm font-bold tracking-tight text-black shadow-[0_16px_50px_-12px_rgba(52,211,153,0.6)] ring-1 ring-inset ring-white/20 transition duration-300 hover:shadow-[0_20px_60px_-12px_rgba(56,189,248,0.7)] focus:outline-none focus:ring-2 focus:ring-[#34D399]/60"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                {submitLabel}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-white/35">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Şifre HttpOnly bir çerezde saklanır — URL&apos;de asla görünmez.
            </p>
            <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
              {footerCaption}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create the server actions file**

Create `app/bakcakanat/_actions.ts`:

```typescript
"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { signInBakcakanat, signOutBakcakanat } from "@/lib/admin-auth";

/**
 * Akçakanat gate sign-in. Validates against BAKCAKANAT_PASSWORD and stores its
 * own HttpOnly cookie, so the domain board can be shared independently of the
 * other admin keys. The password never appears in the URL.
 */
export async function bakcakanatSignInAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get("access") ?? "");
  await signInBakcakanat(candidate);
  redirect("/bakcakanat" as Route);
}

/**
 * Sign out of the Akçakanat board and return to its gate.
 */
export async function bakcakanatSignOutAction(): Promise<void> {
  await signOutBakcakanat();
  redirect("/bakcakanat" as Route);
}
```

- [ ] **Step 4: Create the page**

Create `app/bakcakanat/page.tsx` (ported verbatim from `ubterzioglu/ubt2026`):

```typescript
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isBakcakanatAuthenticated } from "@/lib/admin-auth";
import { BakcakanatLogin } from "@/app/bakcakanat/_components/bakcakanat-login";
import {
  bakcakanatSignInAction,
  bakcakanatSignOutAction
} from "@/app/bakcakanat/_actions";
import {
  BAKCAKANAT_BRAND_GRADIENT,
  BAKCAKANAT_EMERALD
} from "@/app/bakcakanat/_components/theme";
import {
  getAllAkcakanatDomainsAdmin,
  getAkcakanatDomainByIdAdmin,
  createAkcakanatDomain,
  updateAkcakanatDomain,
  deleteAkcakanatDomain,
  clampAkcakanatPriority
} from "@/lib/akcakanat-domains";
import type { AkcakanatDomainItem } from "@/lib/akcakanat-domains";

export const metadata = {
  title: "Akçakanat · Domain Yönetimi",
  robots: { index: false, follow: false }
};

interface BakcakanatPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function normalizeSiteHref(site: string): string | null {
  const trimmed = site.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Shared dark input styling so every cell reads as one premium glass surface.
const darkInput =
  "w-full rounded-[0.7rem] border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition focus:border-[#34D399]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#34D399]/12";
const formLabel =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50";

// Filter chip styling (mirrors the /batubt board).
const chipBase = "rounded-full px-3 py-1 text-[11px] font-semibold transition";
const chipActive =
  "bg-[#34D399] text-black shadow-[0_8px_24px_-8px_rgba(52,211,153,0.6)]";
const chipIdle =
  "border border-white/10 bg-white/[0.04] text-white/70 hover:border-[#34D399]/40 hover:text-white";

// Importance rank options: 1 = most important, 10 = least important.
const PRIORITY_OPTIONS = Array.from({ length: 10 }, (_, index) => {
  const value = index + 1;
  const label =
    value === 1 ? "1 · en önemli" : value === 10 ? "10 · en önemsiz" : `${value}`;
  return { value, label };
});

function parsePriority(value: string): number {
  return clampAkcakanatPriority(Number.parseInt(value, 10));
}

type FilterKey = "priority" | "email" | "redirect" | "hosting" | "payment";

export default async function BakcakanatPage({
  searchParams
}: BakcakanatPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasAccess = await isBakcakanatAuthenticated();

  if (!hasAccess) {
    return (
      <BakcakanatLogin
        brand="Akçakanat"
        subtitle="Domain Yönetimi"
        footerCaption="ubterzioglu.de · internal"
        eyebrow="Yönetim erişimi"
        title="Domain portföy panosu"
        description="Akçakanat domainlerinin hosting, e-posta ve not kayıtlarını bu özel pano üzerinden yönetiyoruz. Devam etmek için şifreyi gir."
        submitLabel="Panoyu aç"
        signIn={bakcakanatSignInAction}
      />
    );
  }

  const result = await getAllAkcakanatDomainsAdmin();
  const createdParam = readParam(params.created);
  const updatedParam = readParam(params.updated);
  const deletedParam = readParam(params.deleted);
  const errorParam = readParam(params.error);
  const editId = readParam(params.edit);
  const editing = editId ? await getAkcakanatDomainByIdAdmin(editId) : null;

  const filters: Record<FilterKey, string> = {
    priority: readParam(params.priority),
    email: readParam(params.email),
    redirect: readParam(params.redirect),
    hosting: readParam(params.hosting),
    payment: readParam(params.payment)
  };

  async function createAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const outcome = await createAkcakanatDomain({
      site: (formData.get("site") as string | null) ?? "",
      domainInfo: (formData.get("domainInfo") as string | null) ?? "",
      hosting: (formData.get("hosting") as string | null) ?? "",
      email: (formData.get("email") as string | null) ?? "",
      hasEmail: ((formData.get("hasEmail") as string | null) ?? "0") === "1",
      redirectTo: (formData.get("redirectTo") as string | null) ?? "",
      paymentDays: (formData.get("paymentDays") as string | null) ?? "",
      paymentMethod: (formData.get("paymentMethod") as string | null) ?? "",
      comment: (formData.get("comment") as string | null) ?? "",
      priority: parsePriority((formData.get("priority") as string | null) ?? "5"),
      sortOrder: Number.parseInt(
        (formData.get("sortOrder") as string | null) ?? "0",
        10
      )
    });

    revalidatePath("/bakcakanat");
    redirect(
      (outcome.ok
        ? "/bakcakanat?created=1"
        : `/bakcakanat?error=${encodeURIComponent(outcome.errorMessage ?? "Kayıt eklenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function updateAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const outcome = await updateAkcakanatDomain(id, {
      site: (formData.get("site") as string | null) ?? "",
      domainInfo: (formData.get("domainInfo") as string | null) ?? "",
      hosting: (formData.get("hosting") as string | null) ?? "",
      email: (formData.get("email") as string | null) ?? "",
      hasEmail: ((formData.get("hasEmail") as string | null) ?? "0") === "1",
      redirectTo: (formData.get("redirectTo") as string | null) ?? "",
      paymentDays: (formData.get("paymentDays") as string | null) ?? "",
      paymentMethod: (formData.get("paymentMethod") as string | null) ?? "",
      comment: (formData.get("comment") as string | null) ?? "",
      priority: parsePriority((formData.get("priority") as string | null) ?? "5"),
      sortOrder: Number.parseInt(
        (formData.get("sortOrder") as string | null) ?? "0",
        10
      )
    });

    revalidatePath("/bakcakanat");
    redirect(
      (outcome.ok
        ? "/bakcakanat?updated=1"
        : `/bakcakanat?error=${encodeURIComponent(outcome.errorMessage ?? "Kayıt güncellenemedi.")}`) as Parameters<
        typeof redirect
      >[0]
    );
  }

  async function deleteAction(formData: FormData) {
    "use server";
    if (!(await isBakcakanatAuthenticated())) {
      redirect("/bakcakanat" as Parameters<typeof redirect>[0]);
    }
    const id = (formData.get("id") as string | null) ?? "";
    if (id) {
      await deleteAkcakanatDomain(id);
    }
    revalidatePath("/bakcakanat");
    redirect("/bakcakanat?deleted=1" as Parameters<typeof redirect>[0]);
  }

  const domains = result.items;
  const filledCount = domains.filter(
    (item) => item.hosting || item.email || item.domainInfo
  ).length;

  // Distinct chip values, computed from the unfiltered list.
  const priorityValues = Array.from(
    new Set(domains.map((item) => item.priority))
  ).sort((a, b) => a - b);
  const hostingValues = Array.from(
    new Set(domains.map((item) => item.hosting).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "tr"));
  const paymentValues = Array.from(
    new Set(domains.map((item) => item.paymentMethod).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const visibleDomains = domains.filter((item) => {
    if (filters.priority && String(item.priority) !== filters.priority) {
      return false;
    }
    if (filters.email === "var" && !item.hasEmail) return false;
    if (filters.email === "yok" && item.hasEmail) return false;
    if (filters.redirect === "var" && !item.redirectTo) return false;
    if (filters.redirect === "yok" && item.redirectTo) return false;
    if (filters.hosting && item.hosting !== filters.hosting) return false;
    if (filters.payment && item.paymentMethod !== filters.payment) return false;
    return true;
  });

  // Builds a filter link that keeps every other active filter intact.
  function filterHref(key: FilterKey, value: string): string {
    const merged = { ...filters, [key]: value };
    const query = new URLSearchParams();
    for (const [paramKey, paramValue] of Object.entries(merged)) {
      if (paramValue) query.set(paramKey, paramValue);
    }
    const qs = query.toString();
    return qs ? `/bakcakanat?${qs}` : "/bakcakanat";
  }

  const hasActiveFilter = Object.values(filters).some(Boolean);

  // Open the add-form accordion automatically only while editing a record.
  const formOpen = Boolean(editing);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#060908] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow field — black · emerald · sky */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 8%, rgba(52,211,153,0.14), transparent 60%)," +
            "radial-gradient(45% 45% at 88% 4%, rgba(56,189,248,0.14), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 120%, rgba(45,212,191,0.10), transparent 60%)," +
            "linear-gradient(180deg, #070b0a 0%, #060908 55%, #040606 100%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 0%, black, transparent 80%)"
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        {/* Header card */}
        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <span
                className="relative flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/15"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                <span className="font-body text-sm font-extrabold tracking-tight text-black">
                  A
                </span>
              </span>
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: BAKCAKANAT_EMERALD }}
                >
                  Akçakanat
                </p>
                <h1 className="font-body text-[clamp(1.2rem,3vw,1.6rem)] font-bold tracking-[-0.03em] text-white">
                  Domain yönetimi
                </h1>
              </div>
            </div>
            <form action={bakcakanatSignOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                Çıkış yap
              </button>
            </form>
          </div>
        </section>

        {/* Feedback banners */}
        {createdParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Kayıt eklendi.
          </div>
        )}
        {updatedParam === "1" && (
          <div className="rounded-[1.1rem] border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-[13px] font-medium text-emerald-200">
            Kayıt güncellendi.
          </div>
        )}
        {deletedParam === "1" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Kayıt silindi.
          </div>
        )}
        {errorParam && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Hata: {errorParam}
          </div>
        )}
        {result.source === "env-missing" && (
          <div className="rounded-[1.1rem] border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-[13px] font-medium text-amber-200">
            Supabase bağlantısı yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY
            eksik). Kayıtlar yüklenemiyor.
          </div>
        )}
        {result.source === "error" && (
          <div className="rounded-[1.1rem] border border-rose-400/25 bg-rose-400/10 px-5 py-3 text-[13px] font-medium text-rose-200">
            Kayıtlar yüklenirken hata oluştu: {result.errorMessage}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Toplam domain", value: domains.length },
            { label: "Bilgisi girilmiş", value: filledCount },
            { label: "Gösterilen", value: visibleDomains.length }
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: BAKCAKANAT_EMERALD }}
              >
                {stat.label}
              </p>
              <p className="mt-1.5 font-body text-2xl font-bold text-white">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        {/* Add / edit form — collapsed-by-default accordion; "Düzenle" opens it */}
        <details
          open={formOpen}
          className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
            <h2 className="flex items-center gap-2 font-body text-base font-semibold text-white">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-black"
                style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
              >
                +
              </span>
              {editing ? `Kaydı düzenle · ${editing.site}` : "Yeni site ekle"}
            </h2>
            <span className="flex items-center gap-3">
              {editing ? (
                <a
                  href="/bakcakanat"
                  className="text-[13px] font-semibold"
                  style={{ color: BAKCAKANAT_EMERALD }}
                >
                  İptal
                </a>
              ) : null}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/40 transition-transform duration-200 group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <form
            action={editing ? updateAction : createAction}
            className="space-y-4 px-6 pb-6 pt-1 sm:px-8"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className={formLabel}>
                  Site <span style={{ color: BAKCAKANAT_EMERALD }}>*</span>
                </span>
                <input
                  type="text"
                  name="site"
                  required
                  minLength={3}
                  maxLength={253}
                  defaultValue={editing?.site ?? ""}
                  placeholder="ör. example.com"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Domain</span>
                <input
                  type="text"
                  name="domainInfo"
                  maxLength={300}
                  defaultValue={editing?.domainInfo ?? ""}
                  placeholder="Kayıt firması / bitiş tarihi…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Hosting</span>
                <input
                  type="text"
                  name="hosting"
                  maxLength={300}
                  defaultValue={editing?.hosting ?? ""}
                  placeholder="Hosting sağlayıcı…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Email</span>
                <input
                  type="text"
                  name="email"
                  maxLength={300}
                  defaultValue={editing?.email ?? ""}
                  placeholder="E-posta sağlayıcı / adres…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Email var mı?</span>
                <select
                  name="hasEmail"
                  defaultValue={editing?.hasEmail ? "1" : "0"}
                  className={darkInput}
                >
                  <option value="0" className="bg-[#0b0f0e] text-white">
                    Yok
                  </option>
                  <option value="1" className="bg-[#0b0f0e] text-white">
                    Var
                  </option>
                </select>
              </label>
              <label className="block">
                <span className={formLabel}>Yönlendirme (nereye)</span>
                <input
                  type="text"
                  name="redirectTo"
                  maxLength={300}
                  defaultValue={editing?.redirectTo ?? ""}
                  placeholder="Yoksa boş bırak — ör. corteqs.net"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Ödeme günleri</span>
                <input
                  type="text"
                  name="paymentDays"
                  maxLength={300}
                  defaultValue={editing?.paymentDays ?? ""}
                  placeholder="ör. her yıl 20 Nisan"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Ödeme yöntemi</span>
                <input
                  type="text"
                  name="paymentMethod"
                  maxLength={300}
                  defaultValue={editing?.paymentMethod ?? ""}
                  placeholder="ör. sanal kart (Revolut)"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Yorum</span>
                <input
                  type="text"
                  name="comment"
                  maxLength={1000}
                  defaultValue={editing?.comment ?? ""}
                  placeholder="Opsiyonel not…"
                  className={darkInput}
                />
              </label>
              <label className="block">
                <span className={formLabel}>Önem sırası</span>
                <select
                  name="priority"
                  defaultValue={editing?.priority ?? 5}
                  className={darkInput}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0b0f0e] text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={formLabel}>Sıra</span>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={editing?.sortOrder ?? (domains.length + 1) * 10}
                  className={darkInput}
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[0.9rem] px-6 py-2.5 text-[13px] font-bold tracking-tight text-black shadow-[0_12px_40px_-8px_rgba(52,211,153,0.5)] ring-1 ring-inset ring-white/15 transition hover:shadow-[0_16px_50px_-8px_rgba(56,189,248,0.6)]"
              style={{ backgroundImage: BAKCAKANAT_BRAND_GRADIENT }}
            >
              {editing ? "Değişiklikleri kaydet" : "Site ekle"}
            </button>
          </form>
        </details>

        {/* Filters — one group per field */}
        <section className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Önem
              </span>
              <a
                href={filterHref("priority", "")}
                className={`${chipBase} ${filters.priority ? chipIdle : chipActive}`}
              >
                Tümü
              </a>
              {priorityValues.map((value) => (
                <a
                  key={value}
                  href={filterHref("priority", String(value))}
                  title="1 en önemli · 10 en önemsiz"
                  className={`${chipBase} ${
                    filters.priority === String(value) ? chipActive : chipIdle
                  }`}
                >
                  {value}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Email
              </span>
              {[
                { value: "", label: "Tümü" },
                { value: "var", label: "Var" },
                { value: "yok", label: "Yok" }
              ].map((option) => (
                <a
                  key={option.label}
                  href={filterHref("email", option.value)}
                  className={`${chipBase} ${
                    filters.email === option.value ? chipActive : chipIdle
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Yönlendirme
              </span>
              {[
                { value: "", label: "Tümü" },
                { value: "var", label: "Var" },
                { value: "yok", label: "Yok" }
              ].map((option) => (
                <a
                  key={option.label}
                  href={filterHref("redirect", option.value)}
                  className={`${chipBase} ${
                    filters.redirect === option.value ? chipActive : chipIdle
                  }`}
                >
                  {option.label}
                </a>
              ))}
            </div>
            {hostingValues.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Hosting
                </span>
                <a
                  href={filterHref("hosting", "")}
                  className={`${chipBase} ${filters.hosting ? chipIdle : chipActive}`}
                >
                  Tümü
                </a>
                {hostingValues.map((value) => (
                  <a
                    key={value}
                    href={filterHref("hosting", value)}
                    className={`${chipBase} ${
                      filters.hosting === value ? chipActive : chipIdle
                    }`}
                  >
                    {value}
                  </a>
                ))}
              </div>
            )}
            {paymentValues.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Ödeme
                </span>
                <a
                  href={filterHref("payment", "")}
                  className={`${chipBase} ${filters.payment ? chipIdle : chipActive}`}
                >
                  Tümü
                </a>
                {paymentValues.map((value) => (
                  <a
                    key={value}
                    href={filterHref("payment", value)}
                    className={`${chipBase} ${
                      filters.payment === value ? chipActive : chipIdle
                    }`}
                  >
                    {value}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Domain list — one compact read-only row per record */}
        <section className="space-y-2">
          {visibleDomains.length === 0 ? (
            <p className="rounded-[1.3rem] border border-dashed border-white/15 px-5 py-8 text-center text-[13px] text-white/50">
              {domains.length === 0
                ? "Henüz kayıt yok. Yukarıdan ilk siteyi ekle."
                : hasActiveFilter
                  ? "Bu filtreyle eşleşen kayıt yok."
                  : "Kayıt bulunamadı."}
            </p>
          ) : (
            visibleDomains.map((item) => (
              <DomainRow key={item.id} item={item} deleteAction={deleteAction} />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

interface DomainRowProps {
  item: AkcakanatDomainItem;
  deleteAction: (formData: FormData) => void | Promise<void>;
}

/**
 * One compact read-only row. Editing happens in the top accordion form via the
 * "Düzenle" link (?edit=id); only deletion stays inline.
 */
function DomainRow({ item, deleteAction }: DomainRowProps) {
  const siteHref = normalizeSiteHref(item.site);
  const detailLine = [
    item.domainInfo,
    item.email ? `E-posta: ${item.email}` : "",
    item.paymentDays ? `Ödeme: ${item.paymentDays}` : "",
    item.comment
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="rounded-[0.95rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:flex-nowrap">
        {/* 1) Importance rank */}
        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-bold text-white/80"
          title={`Önem: ${item.priority} (1 en önemli · 10 en önemsiz)`}
        >
          {item.priority}
        </span>

        {/* 2) Site (clickable URL) — primary, takes remaining width */}
        {siteHref ? (
          <a
            href={siteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate font-body text-[14px] font-semibold text-white transition hover:text-[#34D399]"
            title={item.site}
          >
            {item.site}
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate font-body text-[14px] font-semibold text-white/50">
            (site yok)
          </span>
        )}

        {/* 3) Hosting (hidden on small screens) */}
        {item.hosting ? (
          <span className="hidden max-w-[150px] shrink-0 truncate text-[11px] text-white/45 lg:inline">
            {item.hosting}
          </span>
        ) : null}

        {/* 4) Email var/yok badge */}
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            item.hasEmail
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={item.hasEmail ? "E-postası var" : "E-postası yok"}
        >
          {item.hasEmail ? "email ✓" : "email —"}
        </span>

        {/* 5) Redirect badge */}
        <span
          className={`inline-flex max-w-[180px] shrink-0 items-center truncate rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
            item.redirectTo
              ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
              : "border-white/10 bg-white/[0.04] text-white/40"
          }`}
          title={
            item.redirectTo
              ? `Yönlendirme: ${item.redirectTo}`
              : "Yönlendirme yok"
          }
        >
          {item.redirectTo ? `→ ${item.redirectTo}` : "→ yok"}
        </span>

        {/* 6) Payment method badge */}
        {item.paymentMethod ? (
          <span
            className="inline-flex max-w-[150px] shrink-0 items-center truncate rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-300"
            title={`Ödeme yöntemi: ${item.paymentMethod}`}
          >
            {item.paymentMethod}
          </span>
        ) : null}

        {/* 7) Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={`/bakcakanat?edit=${item.id}`}
            className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-[#34D399]/40 hover:text-[#34D399]"
          >
            Düzenle
          </a>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex min-h-[30px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300"
            >
              Sil
            </button>
          </form>
        </div>
      </div>

      {/* Optional second line: registrar info, e-mail provider, payment days, notes */}
      {detailLine ? (
        <div className="border-t border-white/[0.06] px-4 py-2">
          <span className="text-[11px] text-white/45">{detailLine}</span>
        </div>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual smoke test**

Run: `npm run dev` (in background), then open `http://localhost:3000/bakcakanat` in a browser.
Expected: the password gate renders. Enter `Burakubt2026**` (from `.env.local`), submit, and confirm the domain board loads showing 14 rows. Test add/edit/delete on a throwaway row to confirm round-trip works, then delete the throwaway row.

- [ ] **Step 7: Commit**

```bash
git add app/bakcakanat
git commit -m "feat: port /bakcakanat domain management route"
```

---

### Task 6: Relocate public marketing routes under `/mvp`

**Files:**
- Create: `app/mvp/page.tsx` (moved from `app/page.tsx`)
- Create: `app/mvp/contact/page.tsx` (moved from `app/contact/page.tsx`)
- Create: `app/mvp/insights/page.tsx` (moved from `app/insights/page.tsx`)
- Create: `app/mvp/insights/[slug]/page.tsx` (moved from `app/insights/[slug]/page.tsx`)
- Create: `app/mvp/ventures/[slug]/page.tsx` (moved from `app/ventures/[slug]/page.tsx`)
- Modify: `components/marketing-shell.tsx` (update internal nav links to `/mvp` prefix)
- Modify: `app/sitemap.ts` (update URLs to `/mvp` prefix)
- Modify: `app/robots.ts` (no path change needed — only disallow rules reference `/admin`)
- Delete: `app/page.tsx`, `app/contact/page.tsx`, `app/insights/page.tsx`, `app/insights/[slug]/page.tsx`, `app/ventures/[slug]/page.tsx` (old locations, after content is moved)

**Interfaces:**
- Consumes: `getPublicSiteSnapshot`, `getLocaleFromParams`, `filterFeaturedVentures`, `filterPublishedInsights` from `lib/site-data.ts` (unchanged); `MarketingShell` from `components/marketing-shell.tsx`.
- Produces: working pages at `/mvp`, `/mvp/contact`, `/mvp/insights`, `/mvp/insights/[slug]`, `/mvp/ventures/[slug]`.

- [ ] **Step 1: Read the three page files not yet in context**

Run these Read calls to capture exact current content before moving (paths: `app/contact/page.tsx`, `app/insights/page.tsx`, `app/insights/[slug]/page.tsx`, `app/ventures/[slug]/page.tsx`). This step has no code — it's a reminder to inspect each file's current imports/links before copying, since any relative internal `href="/..."` inside them must be rewritten to `href="/mvp/..."` in the next step.

- [ ] **Step 2: Move `app/page.tsx` to `app/mvp/page.tsx`**

Copy the full existing content of `app/page.tsx` into a new file `app/mvp/page.tsx`, unchanged (it already builds links via `MarketingShell`'s nav and its own `Link href={...}` calls to `/ventures/...` and `/insights/...` — those get fixed in Step 6, not here, since this file's own internal links point to sibling routes that are also moving to `/mvp`). Update this file's own two internal `Link` targets:

- `href={`/ventures/${venture.slug}?lang=${locale}`}` → `href={`/mvp/ventures/${venture.slug}?lang=${locale}`}`
- `href={`/insights?lang=${locale}`}` → `href={`/mvp/insights?lang=${locale}`}`
- `href={`/insights/${insight.slug}?lang=${locale}`}` → `href={`/mvp/insights/${insight.slug}?lang=${locale}`}`

Then delete the old `app/page.tsx` (it will be replaced by the new coming-soon page in Task 7 — do not leave it in place).

- [ ] **Step 3: Move `app/contact/page.tsx` to `app/mvp/contact/page.tsx`**

Copy the file to the new path unchanged unless it contains internal `Link`/`href` references to `/`, `/insights`, or `/ventures` — if so, prefix those with `/mvp`. Delete the old file/folder afterward.

- [ ] **Step 4: Move `app/insights/page.tsx` to `app/mvp/insights/page.tsx`**

Copy the file to the new path, prefixing any internal links to `/`, `/insights/[slug]`, or `/ventures/[slug]` with `/mvp`. Delete the old file/folder afterward.

- [ ] **Step 5: Move `app/insights/[slug]/page.tsx` to `app/mvp/insights/[slug]/page.tsx`**

Copy the file to the new path, prefixing any internal links the same way. Delete the old file/folder afterward.

- [ ] **Step 6: Move `app/ventures/[slug]/page.tsx` to `app/mvp/ventures/[slug]/page.tsx`**

Copy the file to the new path, prefixing any internal links the same way. Delete the old file/folder afterward.

- [ ] **Step 7: Update `components/marketing-shell.tsx` nav links**

Modify `c:\temp_private\burakakcakanat\components\marketing-shell.tsx`:

```typescript
import Link from "next/link";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { type Locale } from "@/lib/site-types";

type Props = {
  children: ReactNode;
  locale: Locale;
};

const labels = {
  en: {
    home: "Home",
    insights: "Insights",
    contact: "Contact",
    admin: "Admin"
  },
  tr: {
    home: "Ana Sayfa",
    insights: "İçgörüler",
    contact: "İletişim",
    admin: "Panel"
  }
} as const;

export function MarketingShell({ children, locale }: Props) {
  const copy = labels[locale];

  return (
    <div className="site-frame">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-8 pt-6 md:px-10">
        <Link href={`/mvp?lang=${locale}`} className="space-y-1">
          <div className="kicker">Burak Akçakanat</div>
          <div className="display-title text-xl text-white md:text-2xl">
            burakakcakanat.com.tr
          </div>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-5 text-sm text-white/70">
            <Link href={`/mvp?lang=${locale}`} className="hover:text-white">
              {copy.home}
            </Link>
            <Link href={`/mvp/insights?lang=${locale}`} className="hover:text-white">
              {copy.insights}
            </Link>
            <Link href={`/mvp/contact?lang=${locale}`} className="hover:text-white">
              {copy.contact}
            </Link>
            <Link href="/admin" className="hover:text-white">
              {copy.admin}
            </Link>
          </nav>
          <LocaleSwitcher locale={locale} />
        </div>
        <div className="md:hidden">
          <LocaleSwitcher locale={locale} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 md:px-10">
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-10 pt-4 text-sm text-white/48 md:flex-row md:items-center md:justify-between md:px-10">
        <p>Burak Akçakanat · Doha · Dubai · Istanbul</p>
        <p>Luxury editorial portfolio powered by Next.js and Supabase.</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 8: Update `app/sitemap.ts`**

Modify `c:\temp_private\burakakcakanat\app\sitemap.ts`:

```typescript
import type { MetadataRoute } from "next";

import { getPublicSiteSnapshot } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getPublicSiteSnapshot();
  const base = "https://burakakcakanat.com.tr";

  return [
    {
      url: base
    },
    {
      url: `${base}/mvp`,
      lastModified: new Date()
    },
    {
      url: `${base}/mvp/insights`,
      lastModified: new Date()
    },
    {
      url: `${base}/mvp/contact`,
      lastModified: new Date()
    },
    ...snapshot.ventures.map((venture) => ({
      url: `${base}/mvp/ventures/${venture.slug}`,
      lastModified: new Date()
    })),
    ...snapshot.insights.map((insight) => ({
      url: `${base}/mvp/insights/${insight.slug}`,
      lastModified: new Date(insight.publishedAt)
    }))
  ];
}
```

- [ ] **Step 9: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors. If any test files under `e2e/` or `tests/` reference the old paths (`/`, `/insights`, `/ventures`) expecting marketing content, note them for Task 8 — do not fix them here.

- [ ] **Step 10: Commit**

```bash
git add app/mvp components/marketing-shell.tsx app/sitemap.ts
git add -u app/page.tsx app/contact app/insights app/ventures
git commit -m "refactor: relocate public marketing routes under /mvp"
```

---

### Task 7: Build the premium "coming soon" homepage

**Files:**
- Create: `app/page.tsx` (new homepage — static, no Supabase dependency)

**Interfaces:**
- Produces: the `/` route rendering a standalone "coming soon" page. Does not consume `MarketingShell`, `lib/site-data.ts`, or any Supabase call — this page must render even if the database is unreachable.

- [ ] **Step 1: Create the coming-soon homepage**

Create `app/page.tsx`:

```typescript
export const metadata = {
  title: "Burak Akçakanat | Yakında",
  description:
    "Burak Akçakanat'ın yeni stratejik platformu yapım aşamasında. Çok yakında yayında."
};

export default function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#05070c] px-6 py-16">
      {/* Ambient glow field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(212,176,106,0.16), transparent 60%)," +
            "radial-gradient(50% 45% at 85% 8%, rgba(143,184,205,0.14), transparent 58%)," +
            "radial-gradient(70% 70% at 50% 115%, rgba(212,176,106,0.10), transparent 60%)," +
            "linear-gradient(180deg, #05070c 0%, #04060a 55%, #030408 100%)"
        }}
      />
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(120% 80% at 50% 20%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 80% at 50% 20%, black, transparent 75%)"
        }}
      />
      {/* Floating orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full blur-[130px]"
        style={{ background: "rgba(212,176,106,0.22)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 rounded-full blur-[140px]"
        style={{ background: "rgba(143,184,205,0.20)" }}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4b06a]/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4b06a]" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60">
            Yapım Aşamasında
          </span>
        </div>

        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          Burak Akçakanat
        </p>

        <h1 className="mt-5 bg-gradient-to-br from-white via-white to-[#d4b06a] bg-clip-text text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-transparent">
          Çok yakında
          <br />
          yayında.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-white/60 md:text-lg">
          Yeni stratejik platform üzerinde çalışıyoruz. Venture mimarisi,
          liderlik zekâsı ve büyüme stratejisi tek bir premium deneyimde
          buluşuyor.
        </p>

        <div className="mt-10 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
          <span>Doha</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Dubai</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Istanbul</span>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev` (in background), open `http://localhost:3000/` in a browser.
Expected: dark premium "coming soon" page renders with gold/white gradient headline, pulsing status badge, and city footer — no console errors, no Supabase network calls (check DevTools Network tab).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace homepage with premium coming-soon page"
```

---

### Task 8: Fix references in tests, sitemap, and root layout metadata

**Files:**
- Modify: any files under `e2e/` or `tests/` that hard-code `/`, `/insights`, or `/ventures` as marketing-content routes (found via Task 6 Step 9)
- Modify: `app/layout.tsx` (only if its metadata description should now reflect the coming-soon homepage rather than the full marketing description — see Step 2)

**Interfaces:**
- Consumes: nothing new.
- Produces: a green test suite and accurate root metadata.

- [ ] **Step 1: Search for hard-coded old-path references**

Run:

```bash
grep -rn "\"/\"" e2e tests 2>/dev/null
grep -rln "goto(\"/\")\|goto('/')" e2e tests 2>/dev/null
grep -rln "/insights\|/ventures\|/contact" e2e tests 2>/dev/null
```

For every match that asserts on marketing-page content (hero title, ventures grid, insights list, contact form) at the root path, update the test to navigate to `/mvp` (or `/mvp/insights`, `/mvp/contact`, `/mvp/ventures/[slug]`) instead of `/`. Do not change tests that intentionally assert on the new coming-soon homepage content.

- [ ] **Step 2: Decide whether to update root layout metadata**

Open `app/layout.tsx`. Its current `metadata.description` reads: "Premium bilingual personal platform for Burak Akçakanat, presenting venture architecture, leadership intelligence, and GCC-Turkiye growth strategy." Since `/` now shows a coming-soon page rather than the full marketing site, and `app/page.tsx` (Task 7) already sets its own page-level `metadata` (which Next.js merges over the layout's), no change is required here — Next.js metadata merging means the homepage's own title/description already override the layout defaults for `/`. Leave `app/layout.tsx` unchanged.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all tests pass. If any fail due to path assumptions not caught in Step 1, fix them the same way (repoint to `/mvp/*`).

- [ ] **Step 4: Run e2e tests**

Run: `npm run e2e`
Expected: all tests pass (Playwright may need `npm run build && npm run start` running in another terminal first, per `playwright.config.ts` — check that file's `webServer` config to confirm whether it auto-starts the dev server).

- [ ] **Step 5: Commit**

```bash
git add e2e tests
git commit -m "test: repoint marketing-page tests to /mvp routes"
```

Note: if Step 1 found no matches, skip Steps 3-5's `git add`/commit for test files — instead just run Step 3 and Step 4 to confirm the suite is still green, and note in the final summary that no test changes were needed.

---

## Post-plan verification checklist

- [ ] `npm run build` completes with no errors (validates all routes compile together, including the new `/mvp/*` tree and `/bakcakanat`)
- [ ] `/bakcakanat` gate rejects wrong password, accepts `BAKCAKANAT_PASSWORD`, and lists 14 migrated domains
- [ ] `/mvp` renders the full original homepage content (ventures, insights, timeline)
- [ ] `/mvp/insights`, `/mvp/insights/[slug]`, `/mvp/ventures/[slug]`, `/mvp/contact` all render without 404s
- [ ] `/` renders the new coming-soon page
- [ ] `/admin` and `/api/*` still work at their original paths, unaffected
- [ ] `env.local.ubterzioglu` does not appear in `git status` as trackable (confirmed ignored)
