// src/utils/normalization.ts
// Text normalization utilities for OCR and drug matching

/**
 * Normalize text for comparison (lowercase, remove extra spaces, special chars)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize drug/medicine name for matching
 */
export function normalizeDrugName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Extract tokens from text
 */
export function tokenize(text: string, minLength = 3): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length >= minLength);
}

/**
 * Generate n-grams from tokens
 */
export function generateNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}
