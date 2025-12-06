// Controller for POST /api/scan — reads in-memory upload (set by middleware),
// calls service to process the buffer, and returns the result.

import { Request, Response } from "express";
import { processScan } from "../services/scan.service";
import type { UploadRequest } from "../middlewares/upload";

export async function handleScan(req: Request, res: Response): Promise<void> {
  const r = req as UploadRequest;

  if (!r.fileBuffer) {
    res.status(400).json({ error: "missing file in request (form key: 'file')" });
    return;
  }

  try {
    const result = await processScan(r.fileBuffer, r.filename ?? "upload");
    res.status(200).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // keep error shape simple for now
    res.status(500).json({ error: "scan processing failed", detail: msg });
  }
}
