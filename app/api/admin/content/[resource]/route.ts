import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import {
  fallbackResourceData,
  normalizeCollectionForStorage,
  parseCollectionPayload,
  parseSingletonPayload,
  type CollectionResourceName,
  type ResourceName
} from "@/lib/resources";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";

function isValidResource(value: string): value is ResourceName {
  return value in fallbackResourceData;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resource = (await context.params).resource;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  return NextResponse.json({ data: fallbackResourceData[resource] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resource = (await context.params).resource;
  if (!isValidResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  const client = createServiceRoleSupabaseClient();

  try {
    const body = (await request.json()) as { payload: unknown };

    if (resource === "site_settings") {
      const payload = parseSingletonPayload(body.payload);
      const { error } = await client.from("site_settings").upsert(
        {
          key: "primary",
          payload
        },
        {
          onConflict: "key"
        }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const parsed = parseCollectionPayload(resource as CollectionResourceName, body.payload);
    const normalized = normalizeCollectionForStorage(resource as CollectionResourceName, parsed);

    const { error: deleteError } = await client.from(resource).delete().gt("order_index", -1);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    if (normalized.length > 0) {
      const { error: insertError } = await client.from(resource).insert(normalized);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid resource payload." }, { status: 400 });
  }
}
