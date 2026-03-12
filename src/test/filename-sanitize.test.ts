import { describe, it, expect } from "vitest";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

describe("filename sanitize", () => {
  it("replaces cyrillic chars", () => {
    const result = sanitizeFilename("Снимок экрана 2026.png");
    expect(result).toMatch(/^_+2026\.png$/);
    expect(/[а-яА-ЯёЁ ]/.test(result)).toBe(false);
  });

  it("keeps latin chars and numbers", () => {
    expect(sanitizeFilename("photo-2026_03.png")).toBe("photo-2026_03.png");
  });

  it("replaces spaces", () => {
    expect(sanitizeFilename("my file name.pdf")).toBe("my_file_name.pdf");
  });

  it("replaces special chars", () => {
    expect(sanitizeFilename("file (1) [copy].jpg")).toBe("file__1___copy_.jpg");
  });

  it("handles empty extension", () => {
    expect(sanitizeFilename("файл")).toBe("____");
  });

  it("keeps dots and hyphens", () => {
    expect(sanitizeFilename("my.file-v2.tar.gz")).toBe("my.file-v2.tar.gz");
  });
});
