import { NextResponse } from "next/server";

import { createLead } from "@/lib/site-data";
import { leadSubmissionSchema } from "@/lib/site-types";

export async function POST(request: Request) {
  try {
    const payload = leadSubmissionSchema.parse(await request.json());
    const result = await createLead(payload);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
