import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/auth";
import { updateLeadStatus } from "@/lib/site-data";
import { leadStatusSchema } from "@/lib/site-types";

const payloadSchema = z.object({
  status: leadStatusSchema
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = payloadSchema.parse(await request.json());
    const { id } = await context.params;
    const { error } = await updateLeadStatus(id, status);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
