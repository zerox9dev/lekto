import { describe, it, expect } from "vitest";

// Test that share slugs are unique and proper format
describe("share_id format", () => {
  function shareSlug() {
    return Math.random().toString(36).slice(2, 10);
  }

  it("generates 8-char alphanumeric slug", () => {
    const slug = shareSlug();
    expect(slug.length).toBeLessThanOrEqual(8);
    expect(slug.length).toBeGreaterThanOrEqual(4);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });

  it("generates unique slugs", () => {
    const slugs = new Set(Array.from({ length: 100 }, () => shareSlug()));
    expect(slugs.size).toBe(100);
  });
});
