// Repository stub for OCR/scan persistence.
// Later this will store scan records in a database.

export interface StoredScanRecord {
  id: string;
  extractedText: string;
  confidence?: number;
  raw?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Store a scan result (stub).
 * Later: insert into Postgres or any DB layer.
 */
export async function saveScan(record: StoredScanRecord): Promise<void> {
  // Stub: no-op
  return;
}

/**
 * Fetch a scan record by ID (stub).
 */
export async function getScanById(id: string): Promise<StoredScanRecord | null> {
  return null; // Not implemented
}
