import { describe, expect, it } from "vitest";

import { registerAttempt, resetAttempts } from "@/lib/rate-limit";

describe("rate limiting", () => {
  it("allows the first five attempts and blocks the sixth", () => {
    const key = "127.0.0.1";
    resetAttempts(key);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect(registerAttempt(key, 1000).allowed).toBe(true);
    }

    expect(registerAttempt(key, 1000).allowed).toBe(false);
  });

  it("resets the counter after manual reset", () => {
    const key = "reset-me";
    registerAttempt(key, 1000);
    resetAttempts(key);

    expect(registerAttempt(key, 1000).allowed).toBe(true);
  });
});
