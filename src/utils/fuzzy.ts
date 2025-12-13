// src/utils/fuzzy.ts
// Fuzzy search utilities

export function fuzzyMatch(text: string, pattern: string): boolean {
  return text.toLowerCase().includes(pattern.toLowerCase());
}
