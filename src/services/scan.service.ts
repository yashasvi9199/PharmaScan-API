export interface ScanServiceResult {
  id: string;
  extractedText: string;
  confidence?: number;
  raw?: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Process an uploaded image buffer.
 * This stub only returns a placeholder result so the pipeline stays stable.
 */
export async function processScan(
  fileBuffer: Buffer,
  filename: string
): Promise<ScanServiceResult> {
  return {
    id: `stub-${Date.now()}`,
    extractedText: "",
    confidence: undefined,
    raw: { note: "stub service - OCR not implemented" },
    createdAt: new Date().toISOString(),
  };
}
