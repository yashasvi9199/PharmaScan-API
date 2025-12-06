import { Request, Response } from "express";

/**
 * Handle POST /api/scan
 * Currently a minimal stub that returns 501 Not Implemented.
 * Replace with real logic that validates the multipart upload, invokes OCR service,
 * persists a scan record, and returns a ScanResponse shape.
 */
export async function handleScan(req: Request, res: Response): Promise<void> {
  // Basic guard: if no file present, return 400
  const hasFile = !!(req as any).file || !!(req as any).files;
  if (!hasFile) {
    res.status(400).json({ error: "missing file in request (form key: 'file')" });
    return;
  }

  // Not implemented yet — keeps clients from crashing and provides a clear message.
  res.status(501).json({ error: "Scan endpoint not implemented yet" });
}
