export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateShareId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
