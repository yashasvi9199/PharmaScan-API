export interface OCRAdapterResult {
  text: string;
  confidence?: number;
  raw?: Record<string, unknown>;
}

/**
 * Accepts an image buffer and returns stub OCR output.
 * Replace this when real OCR integration is implemented.
 */
export async function runOCR(buffer: Buffer): Promise<OCRAdapterResult> {
  return {
    text: "",
    confidence: undefined,
    raw: { note: "stub ocr adapter - not implemented" },
  };
}
