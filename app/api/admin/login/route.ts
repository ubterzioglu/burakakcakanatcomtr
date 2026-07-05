import { NextResponse } from "next/server";
import { z } from "zod";

import { isValidAdminPassword, setAdminSessionCookie } from "@/lib/auth";
import { registerAttempt, resetAttempts } from "@/lib/rate-limit";

const loginSchema = z.object({
  password: z.string().min(1)
});

function getRequesterIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function POST(request: Request) {
  const ip = getRequesterIp(request);
  const attempt = registerAttempt(ip);

  if (!attempt.allowed) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please wait before retrying." },
      { status: 429 }
    );
  }

  try {
    const { password } = loginSchema.parse(await request.json());

    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    resetAttempts(ip);
    await setAdminSessionCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
